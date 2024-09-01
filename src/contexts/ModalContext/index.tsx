import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ModalBasicProps } from '@/components/Modal';
import NotificationModal from '@/components/Modal/NotificationModal';
import OkCancelModal from '@/components/Modal/OkCancelModal';
import YesNoModal from '@/components/Modal/YesNoModal';
import type { FCWithChildren } from '@/types/ComponentProps';

type BaseModalFunc<T = void> = (
  message: ReactNode,
  options?: ModalBasicProps
) => Promise<T>;

interface ModalContextProps {
  askYesNo: BaseModalFunc<boolean>;
  notice: BaseModalFunc;
  askOkCancel: BaseModalFunc<boolean>;
}

const ModalContext = createContext<ModalContextProps>({
  askYesNo: async () => true,
  notice: async () => {},
  askOkCancel: async () => true,
});

interface ModalItem {
  id: number;
  Modal: ReactElement;
}

const ModalContextProvider: FCWithChildren = ({ children }) => {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const removeModal = useCallback((id: ModalItem['id']) => {
    setModals(prevModals => prevModals.filter(item => item.id !== id));
  }, []);

  const contextValue = useMemo<ModalContextProps>(
    () => ({
      askYesNo: (message, options) =>
        new Promise(resolve => {
          setModals(prevModals => {
            const id = Date.now();
            const Modal = (
              <YesNoModal
                key={id}
                onYes={() => resolve(true)}
                onNo={() => resolve(false)}
                onHidden={() => {
                  removeModal(id);
                  options?.onHidden?.();
                }}
                {...options}
              >
                {message}
              </YesNoModal>
            );

            return prevModals.concat({
              id,
              Modal,
            });
          });
        }),

      notice: (message, options) =>
        new Promise(resolve => {
          setModals(prevModals => {
            const id = Date.now();
            const Modal = (
              <NotificationModal
                key={id}
                onOk={() => resolve()}
                onHidden={() => {
                  removeModal(id);
                  options?.onHidden?.();
                }}
                {...options}
              >
                {message}
              </NotificationModal>
            );

            return prevModals.concat({
              id,
              Modal,
            });
          });
        }),

      askOkCancel: (message, options) =>
        new Promise<boolean>(resolve => {
          setModals(prevModals => {
            const id = Date.now();
            const Modal = (
              <OkCancelModal
                key={id}
                onOk={() => resolve(true)}
                onCancel={() => resolve(false)}
                onHidden={() => {
                  removeModal(id);
                  options?.onHidden?.();
                }}
                {...options}
              >
                {message}
              </OkCancelModal>
            );

            return prevModals.concat({
              id,
              Modal,
            });
          });
        }),
    }),
    [removeModal]
  );

  return (
    <>
      <ModalContext.Provider value={contextValue}>
        {children}
      </ModalContext.Provider>
      {modals.map(({ Modal }) => Modal)}
    </>
  );
};

export const useModalContext = () => useContext(ModalContext);

export default ModalContextProvider;
