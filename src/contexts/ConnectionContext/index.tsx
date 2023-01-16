import { DataConnection, MediaConnection } from 'peerjs';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';

import RemoteConnection from '@/utils/RemoteConnection';
import EventHandler from '@/utils/RemoteConnection/event/handler';

import { FCWithChildren } from '@/types/ComponentProps';

import { Command, CommandListener, CommandType } from './Command';

export type OnCommand = CommandListener<CommandType>;

export type OnMessage = (message: string) => void;

export type OnCall = EventHandler['call'];

export type OnHangUp = (metadata?: unknown) => void;

interface ConnectionListeners {
  onCommand?: CommandListener<CommandType>;
  onMessage?: OnMessage;
  onCall?: OnCall;
  onHangUp?: OnHangUp;
}

interface ConnectionContextProps {
  id: string;
  isOnline: boolean;
  isDataConnected: boolean;
  isMediaConnected: boolean;
  peerId: string | null;
  call: (id: string, stream: MediaStream) => Promise<MediaStream | null>;
  changeStream: (stream: MediaStream) => Promise<void>;
  sendCommand: <T extends CommandType>(
    type: T,
    param: Command<T>['param'],
    ignorePeer?: boolean
  ) => Promise<void>;
  sendMessage: (message: string, ignorePeer?: boolean) => Promise<void>;
  setOnCommand: (caller?: OnCommand) => void;
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
  sendCommand: async () => {},
  sendMessage: async () => {},
  setOnCommand: () => {},
  setOnMessage: () => {},
  setOnCall: () => {},
  setOnHangUp: () => {},
});

const ConnectionContextProvider: FCWithChildren = ({
  children,
}) => {
  const searchParams = useMemo(() => new URLSearchParams(globalThis.location.search), []);
  const id = useMemo(() => searchParams.get('id') ?? undefined, [searchParams]);
  const connector = useMemo(() => new RemoteConnection(id), [id]);
  const [isOnline, setIsOnline] = useState(false);
  const [peerId, setPeerId] = useState<string>();
  const [dataConnection, setDataConnection] = useState<DataConnection>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();
  const listeners = useRef<ConnectionListeners>({});

  const call = useCallback<ConnectionContextProps['call']>(async (targetId, stream) => (
    connector.call(targetId, stream)
  ), [connector]);

  const changeStream = useCallback<ConnectionContextProps['changeStream']>(async (stream) => {
    if (!peerId) {
      throw ReferenceError('Not connect to peer yet');
    }

    await call(peerId, stream);
  }, [call, peerId]);

  const sendCommand = useCallback<ConnectionContextProps['sendCommand']>(async (
    type: CommandType,
    param: Command<CommandType>['param'],
    ignorePeer = false,
  ) => {
    if (!ignorePeer && !peerId) {
      throw ReferenceError('Not connect to peer yet');
    }
    if (peerId) {
      const message = `#${type}:${param}`;

      await connector.sendMessage(peerId, message);
    }
  }, [connector, peerId]);

  const sendMessage = useCallback<ConnectionContextProps['sendMessage']>(async (
    message,
    ignorePeer = false,
  ) => {
    if (!ignorePeer && !peerId) {
      throw ReferenceError('Not connect to peer yet');
    }
    if (peerId) {
      await connector.sendMessage(peerId, message);
    }
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
      case 'string': {
        const matchs = data.match(/^#(.+?)(?::(.+))$/);

        if (matchs) {
          const [, type, rawParam] = matchs;

          let param = rawParam;

          try {
            param = JSON.parse(rawParam);
          } catch (e) {
            // do nothing
          }

          listeners.current.onCommand?.(
            type as CommandType,
            param as Command<CommandType>['param'],
          );
        } else {
          listeners.current.onMessage?.(data);
        }
        break;
      }

      default:
        break;
    }
  }, [peerId]);

  const handleCall: EventHandler['call'] = async (sourceId, answer, metadata) => {
    const { onCall } = listeners.current;

    if (onCall) {
      await onCall(sourceId, answer, metadata);
    }
  };

  const handleHangUp = useCallback<EventHandler['hangup']>(async (sourceId, metadata) => {
    if (sourceId !== peerId) {
      return;
    }

    listeners.current.onHangUp?.(metadata);
  }, [peerId]);

  const contextValue = useMemo<ConnectionContextProps>(() => ({
    id: connector.id,
    isOnline,
    isDataConnected: !!dataConnection,
    isMediaConnected: !!mediaConnection,
    peerId: peerId ?? null,
    call,
    changeStream,
    sendCommand,
    sendMessage,
    setOnCommand: (caller) => {
      listeners.current.onCommand = caller;
    },
    setOnMessage: (caller) => {
      listeners.current.onMessage = caller;
    },
    setOnCall: (caller) => {
      listeners.current.onCall = caller;
    },
    setOnHangUp: (caller) => {
      listeners.current.onHangUp = caller;
    },
  }), [
    call, changeStream, connector.id, dataConnection, isOnline,
    mediaConnection, peerId, sendMessage, sendCommand,
  ]);

  useEffect(() => {
    connector.addEventListener('online', onOnline);
    connector.addEventListener('offline', onOffline);
    connector.addEventListener('connecteddata', onConnectedData);
    connector.addEventListener('connectedmedia', onConnectedMedia);
    connector.addEventListener('call', handleCall);

    return () => {
      connector.removeEventListener('online', onOnline);
      connector.removeEventListener('offline', onOffline);
      connector.removeEventListener('connecteddata', onConnectedData);
      connector.removeEventListener('connectedmedia', onConnectedMedia);
      connector.removeEventListener('call', handleCall);
    };
  }, [connector]);

  useEffect(() => {
    connector.addEventListener('data', handleData);

    return () => connector.removeEventListener('data', handleData);
  }, [connector, handleData]);

  useEffect(() => {
    connector.addEventListener('hangup', handleHangUp);

    return () => connector.removeEventListener('hangup', handleHangUp);
  }, [connector, handleHangUp]);

  useEffect(() => {
    connector.connect();

    return () => {
      if (connector.isOnline) {
        connector.disconnect();
      }
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
