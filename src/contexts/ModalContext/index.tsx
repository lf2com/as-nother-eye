import React, {
  cloneElement, createContext, FunctionComponent, PropsWithChildren,
  ReactElement, ReactNode, useCallback, useContext, useMemo, useState,
} from 'react';

import ConfirmModal from './components/ConfirmModal';
import NotificationModal from './components/NotificationModal';
import YesNoModal from './components/YesNoModal';

type BaseModalFunc<T = void> = (message: ReactNode, title?: ReactNode) => Promise<T>;

interface ModalContextProps {
  askYesNo: BaseModalFunc<boolean>;
  notice: BaseModalFunc;
  confirm: BaseModalFunc<boolean>;
}

const ModalContext = createContext<ModalContextProps>({
  askYesNo: async () => true,
  notice: async () => {},
  confirm: async () => true,
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
            onHidden={() => removeModal(id)}
          >
            {message}
          </YesNoModal>
        );

        return prevModals.concat({ id, Modal });
      });
    }),

    notice: (message, title) => new Promise((resolve) => {
      setModals((prevModals) => {
        const id = Date.now();
        const Modal = (
          <NotificationModal
            title={title}
            onOk={() => resolve()}
            onHidden={() => removeModal(id)}
          >
            {message}
          </NotificationModal>
        );

        return prevModals.concat({ id, Modal });
      });
    }),

    confirm: (message, title) => new Promise<boolean>((resolve) => {
      setModals((prevModals) => {
        const id = Date.now();
        const Modal = (
          <ConfirmModal
            title={title}
            onOk={() => resolve(true)}
            onCancel={() => resolve(false)}
            onHidden={() => removeModal(id)}
          >
            {message}
          </ConfirmModal>
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
