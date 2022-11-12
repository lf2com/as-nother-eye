import { DataConnection, MediaConnection } from 'peerjs';
import React, {
  createContext, FunctionComponent, PropsWithChildren, useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';

import RemoteConnection from '../../utils/RemoteConnection';
import EventHandler from '../../utils/RemoteConnection/event/handler';

interface ConnectionContextProps {
  connector: RemoteConnection;
  id: string;
  isOnline: boolean;
  isDataConnected: boolean;
  isMediaConnected: boolean;
  peerId: string | null;
}

const ConnectionContext = createContext<ConnectionContextProps>({
  connector: new RemoteConnection(),
  id: '',
  isOnline: false,
  isDataConnected: false,
  isMediaConnected: false,
  peerId: null,
});

const ConnectionContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const searchParams = useMemo(() => new URLSearchParams(globalThis.location.search), []);
  const id = useMemo(() => searchParams.get('id') ?? undefined, [searchParams]);
  const connector = useMemo(() => new RemoteConnection(id), [id]);
  const [isOnline, setIsOnline] = useState(false);
  const [peerId, setPeerId] = useState<string>();
  const [dataConnection, setDataConnection] = useState<DataConnection>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();

  const onOnline = useCallback<EventHandler['online']>(() => setIsOnline(true), []);

  const onOffline = useCallback<EventHandler['offline']>(() => setIsOnline(false), []);

  const onConnectedData = useCallback<EventHandler['connecteddata']>((sourceId, connection) => {
    setPeerId(sourceId);
    setDataConnection(connection);
  }, []);

  const onConnectedMedia = useCallback<EventHandler['connectedmedia']>((_, connection) => {
    setMediaConnection(connection);
  }, []);

  const contextValue = useMemo<ConnectionContextProps>(() => ({
    connector,
    id: connector.id,
    isOnline,
    isDataConnected: !!dataConnection,
    isMediaConnected: !!mediaConnection,
    peerId: peerId ?? null,
  }), [connector, dataConnection, isOnline, mediaConnection, peerId]);

  useEffect(() => {
    connector.addEventListener('online', onOnline);
    connector.addEventListener('offline', onOffline);
    connector.addEventListener('connecteddata', onConnectedData);
    connector.addEventListener('connectedmedia', onConnectedMedia);

    return () => {
      connector.removeEventListener('online', onOnline);
      connector.removeEventListener('offline', onOffline);
      connector.removeEventListener('connecteddata', onConnectedData);
      connector.removeEventListener('connectedmedia', onConnectedMedia);
    };
  }, [connector, onConnectedData, onConnectedMedia, onOffline, onOnline]);

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = () => useContext(ConnectionContext);

export default ConnectionContextProvider;
