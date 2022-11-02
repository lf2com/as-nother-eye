import React, {
  createContext, FunctionComponent, PropsWithChildren, useContext, useMemo,
} from 'react';

import RemoteConnection from '../../utils/RemoteConnection';

interface ConnectionContextProps {
  connector: RemoteConnection;
}

const ConnectionContext = createContext<ConnectionContextProps>({
  connector: new RemoteConnection(),
});

const ConnectionContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const connector = useMemo(() => new RemoteConnection(), []);
  const contextValue = useMemo<ConnectionContextProps>(() => ({
    connector,
  }), [connector]);

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = () => useContext(ConnectionContext);

export default ConnectionContextProvider;
