import React, { createContext, useContext, useMemo } from 'react';

import { FunctionComponentWithChildren } from '@/types/ComponentProps';

interface ModalButtonContextProps {
  disabledAll: boolean;
}

const ModalButtonContext = createContext<ModalButtonContextProps>({
  disabledAll: false,
});

const ModalButtonContextProvider: FunctionComponentWithChildren<ModalButtonContextProps> = ({
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
