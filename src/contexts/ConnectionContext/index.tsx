import React, {
  createContext, FunctionComponent, PropsWithChildren, useContext, useEffect, useMemo, useState,
} from 'react';

import RemoteConnection from '../../utils/RemoteConnection';

interface ConnectionContextProps {
  connector: RemoteConnection;
  isOnline: boolean;
}

const ConnectionContext = createContext<ConnectionContextProps>({
  connector: new RemoteConnection(),
  isOnline: false,
});

const ConnectionContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const searchParams = useMemo(() => new URLSearchParams(globalThis.location.search), []);
  const id = useMemo(() => searchParams.get('id') ?? undefined, [searchParams]);
  const connector = useMemo(() => new RemoteConnection(id), [id]);
  const [isOnline, setIsOnline] = useState(false);

  const contextValue = useMemo<ConnectionContextProps>(() => ({
    connector,
    isOnline,
  }), [connector, isOnline]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    connector.addEventListener('online', onOnline);
    connector.addEventListener('offline', onOffline);

    return () => {
      connector.removeEventListener('online', onOnline);
      connector.removeEventListener('offline', onOffline);
    };
  }, [connector]);

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = () => useContext(ConnectionContext);

export default ConnectionContextProvider;
