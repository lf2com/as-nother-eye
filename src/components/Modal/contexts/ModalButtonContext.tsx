import React, { createContext, useContext, useMemo } from 'react';

import { FCWithChildren } from '@/types/ComponentProps';

interface ModalButtonContextProps {
  disabledAll: boolean;
}

const ModalButtonContext = createContext<ModalButtonContextProps>({
  disabledAll: false,
});

const ModalButtonContextProvider: FCWithChildren<ModalButtonContextProps> = ({
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
