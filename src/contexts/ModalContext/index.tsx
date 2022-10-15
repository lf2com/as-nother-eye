import React, {
  cloneElement, createContext, FunctionComponent, PropsWithChildren,
  ReactElement, ReactNode, useCallback, useContext, useMemo, useState,
} from 'react';

import YesNoModal from './components/YesNoModal';

type AskFunc = (message: ReactNode, title?: ReactNode) => Promise<boolean>;

interface ModalContextProps {
  askYesNo: AskFunc;
}

const ModalContext = createContext<ModalContextProps>({
  askYesNo: async () => true,
});

interface ModalItem {
  id: number;
  Modal: ReactElement,
}

const ModalContextProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const removeModal = useCallback((id: ModalItem['id']) => {
    setModals((prevModals) => prevModals.filter((item) => item.id !== id));
  }, []);

  const contextValue = useMemo<ModalContextProps>(() => ({
    askYesNo: (message, title) => new Promise((resolve) => {
      setModals((prevModals) => {
        const id = Date.now();
        const Modal = (
          <YesNoModal
            title={title}
            onYes={() => resolve(true)}
            onNo={() => resolve(false)}
            onHidden={() => {
              removeModal(id);
            }}
          >
            {message}
          </YesNoModal>
        );

        return prevModals.concat({ id, Modal });
      });
    }),
  }), [removeModal]);

  return (
    <>
      <ModalContext.Provider value={contextValue}>
        {children}
      </ModalContext.Provider>
      {modals.map(({ id, Modal }) => (
        cloneElement(Modal, { key: id })
      ))}
    </>
  );
};

export const useModalContext = () => useContext(ModalContext);

export default ModalContextProvider;
