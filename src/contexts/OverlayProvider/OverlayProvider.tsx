import type { ComponentProps, FC, PropsWithChildren, ReactNode } from 'react';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import Overlay from './Overlay';
import type {
  OverlayContentFn,
  OverlayContentResolve,
  OverlayOption,
} from './types';

interface OverlayContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  open: <C extends OverlayContentFn<V> | ReactNode, V = any>(
    content: C,
    options?: OverlayOption
  ) => Promise<OverlayContentResolve<C>>;
  close: (id: string) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

interface OverlayItem {
  id: string;
  node: ReactNode;
  props: Omit<ComponentProps<typeof Overlay>, 'show'>;
}

const OverlayProvider: FC<PropsWithChildren> = ({ children }) => {
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [closingIds, setClosingIds] = useState<Array<OverlayItem['id']>>([]);

  const close = useCallback<OverlayContextValue['close']>(id => {
    setClosingIds(prevIds =>
      prevIds.includes(id) ? prevIds : prevIds.concat(id)
    );
  }, []);

  const open = useCallback<OverlayContextValue['open']>(
    (content, options = {}) => {
      return new Promise<OverlayContentResolve<typeof content>>(resolve => {
        const id = options.id ?? `overlay_${performance.now()}`;

        const onHidden = () => {
          setOverlays(prevOverlays => {
            const index = prevOverlays.findIndex(overlay => id === overlay.id);

            return index === -1
              ? prevOverlays
              : prevOverlays
                  .slice(0, index)
                  .concat(prevOverlays.slice(index + 1));
          });
          setClosingIds(prevIds => prevIds.filter(prevId => prevId !== id));
        };

        if (options.id) {
          onHidden();
        }

        const closeOverlay = () => {
          setClosingIds(prevIds =>
            prevIds.includes(id) ? prevIds : prevIds.concat(id)
          );
        };

        const hoistOverlay = () => {
          setOverlays(prevOverlays => {
            const index = prevOverlays.findIndex(overlay => id === overlay.id);

            return index === -1
              ? prevOverlays
              : prevOverlays
                  .slice(0, index)
                  .concat(prevOverlays.slice(index + 1))
                  .concat(prevOverlays[index]);
          });
        };

        const isContentNode = typeof content !== 'function';

        const node: ReactNode = isContentNode
          ? content
          : createElement(content, {
              hoistOverlay,
              closeOverlay: result => {
                resolve(result as OverlayContentResolve<typeof content>);
                closeOverlay();
              },
            });

        setOverlays(prevOverlays =>
          prevOverlays.concat({
            id,
            node,
            props: {
              ...options,
              closeOverlay,
              onHidden,
            },
          })
        );

        // if (isContentNode) {
        //   resolve();
        // }
      });
    },
    []
  );

  const value = useMemo<OverlayContextValue>(
    () => ({
      open,
      close,
    }),
    [close, open]
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <div className="fixed top-0 right-0 bottom-0 left-0 z-100 pointer-events-none">
        {overlays.map(({ id, node, props }) => (
          <Overlay key={id} {...props} show={!closingIds.includes(id)}>
            {node}
          </Overlay>
        ))}
      </div>
    </OverlayContext.Provider>
  );
};

export const useOverlayContext = () => {
  const value = useContext(OverlayContext);

  if (!value) {
    throw Error('overlay context is not established');
  }

  return value;
};

export default OverlayProvider;
