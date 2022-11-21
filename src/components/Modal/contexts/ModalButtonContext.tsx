import React, {
  createContext, FunctionComponent, PropsWithChildren, useContext, useMemo,
} from 'react';

interface ModalButtonContextProps {
  disabledAll: boolean;
}

const ModalButtonContext = createContext<ModalButtonContextProps>({
  disabledAll: false,
});

const ModalButtonContextProvider: FunctionComponent<PropsWithChildren<ModalButtonContextProps>> = ({
  disabledAll,
  children,
}) => {
  const contextValue = useMemo(() => ({ disabledAll }), [disabledAll]);

  return (
    <ModalButtonContext.Provider value={contextValue}>
      {children}
    </ModalButtonContext.Provider>
  );
};

export const useModalButtonContext = () => useContext(ModalButtonContext);

export default ModalButtonContextProvider;
