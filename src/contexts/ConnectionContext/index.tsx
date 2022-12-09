import { DataConnection, MediaConnection } from 'peerjs';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import Logger from '../../utils/logger';
import RemoteConnection from '../../utils/RemoteConnection';
import EventHandler from '../../utils/RemoteConnection/event/handler';

import { FunctionComponentWithChildren } from '../../types/ComponentProps';

export type OnMessage = (message: string) => void;

export type OnCall = EventHandler['call'];

export type OnHangUp = (metadata?: unknown) => void;

interface ConnectionContextProps {
  id: string;
  isOnline: boolean;
  isDataConnected: boolean;
  isMediaConnected: boolean;
  peerId: string | null;
  call: (id: string, stream: MediaStream) => Promise<MediaStream | null>;
  changeStream: (stream: MediaStream) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setOnMessage: (caller?: OnMessage) => void;
  setOnCall: (caller?: OnCall) => void;
  setOnHangUp: (caller?: OnHangUp) => void;
}

const ConnectionContext = createContext<ConnectionContextProps>({
  id: '',
  isOnline: false,
  isDataConnected: false,
  isMediaConnected: false,
  peerId: null,
  call: async () => null,
  changeStream: async () => {},
  sendMessage: async () => {},
  setOnMessage: () => {},
  setOnCall: () => {},
  setOnHangUp: () => {},
});

const ConnectionContextProvider: FunctionComponentWithChildren = ({
  children,
}) => {
  const searchParams = useMemo(() => new URLSearchParams(globalThis.location.search), []);
  const id = useMemo(() => searchParams.get('id') ?? undefined, [searchParams]);
  const logger = useMemo(() => new Logger({ tag: `[${id}]` }), [id]);
  const connector = useMemo(() => new RemoteConnection(id), [id]);
  const [isOnline, setIsOnline] = useState(false);
  const [peerId, setPeerId] = useState<string>();
  const [dataConnection, setDataConnection] = useState<DataConnection>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();
  const [onMessage, setOnMessage] = useState<OnMessage>();
  const [onCall, setOnCall] = useState<OnCall>();
  const [onHangUp, setOnHangUp] = useState<OnHangUp>();

  const call = useCallback<ConnectionContextProps['call']>(async (targetId, stream) => (
    connector.call(targetId, stream)
  ), [connector]);

  const changeStream = useCallback<ConnectionContextProps['changeStream']>(async (stream) => {
    if (!peerId) {
      throw ReferenceError('Not connect to peer yet');
    }

    await call(peerId, stream);
  }, [call, peerId]);

  const sendMessage = useCallback<ConnectionContextProps['sendMessage']>(async (message) => {
    if (!peerId) {
      throw ReferenceError('Not connect to peer yet');
    }

    await connector.sendMessage(peerId, message);
  }, [connector, peerId]);

  const onOnline: EventHandler['online'] = () => setIsOnline(true);

  const onOffline: EventHandler['offline'] = () => setIsOnline(false);

  const onConnectedData: EventHandler['connecteddata'] = (sourceId, connection) => {
    setPeerId(sourceId);
    setDataConnection(connection);
  };

  const onConnectedMedia: EventHandler['connectedmedia'] = (_, connection) => {
    setMediaConnection(connection);
  };

  const handleData = useCallback<EventHandler['data']>((sourceId, data) => {
    if (sourceId !== peerId) {
      return;
    }

    switch (typeof data) {
      case 'string':
        onMessage?.(data);
        break;

      default:
        break;
    }
  }, [onMessage, peerId]);

  const handleCall = useCallback<EventHandler['call']>(async (sourceId, answer, metadata) => {
    logger.log('oncall', sourceId, answer);
    if (onCall) {
      await onCall(sourceId, answer, metadata);
    }
  }, [logger, onCall]);

  const handleHangUp = useCallback<EventHandler['hangup']>(async (sourceId, metadata) => {
    if (sourceId !== peerId) {
      return;
    }

    onHangUp?.(metadata);
  }, [onHangUp, peerId]);

  const contextValue = useMemo<ConnectionContextProps>(() => ({
    id: connector.id,
    isOnline,
    isDataConnected: !!dataConnection,
    isMediaConnected: !!mediaConnection,
    peerId: peerId ?? null,
    call,
    changeStream,
    sendMessage,
    setOnMessage: (caller) => setOnMessage(() => caller),
    setOnCall: (caller) => setOnCall(() => caller),
    setOnHangUp: (caller) => setOnHangUp(() => caller),
  }), [
    call, changeStream, connector.id, dataConnection, isOnline,
    mediaConnection, peerId, sendMessage,
  ]);

  useEffect(() => {
    connector.addEventListener('online', onOnline);
    connector.addEventListener('offline', onOffline);
    connector.addEventListener('connecteddata', onConnectedData);
    connector.addEventListener('connectedmedia', onConnectedMedia);
    connector.addEventListener('call', handleCall);
    connector.addEventListener('data', handleData);
    connector.addEventListener('hangup', handleHangUp);

    return () => {
      connector.removeEventListener('online', onOnline);
      connector.removeEventListener('offline', onOffline);
      connector.removeEventListener('connecteddata', onConnectedData);
      connector.removeEventListener('connectedmedia', onConnectedMedia);
      connector.removeEventListener('call', handleCall);
      connector.removeEventListener('data', handleData);
      connector.removeEventListener('hangup', handleHangUp);
    };
  }, [connector, handleCall, handleData, handleHangUp]);

  useEffect(() => {
    connector.connect();

    return () => {
      connector.disconnect();
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
