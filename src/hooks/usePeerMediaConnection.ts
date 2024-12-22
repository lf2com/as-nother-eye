import type { MediaConnection, PeerError } from 'peerjs';
import { useEffect, useMemo, useState } from 'react';

import type GetEventHandlers from '@/types/GetEventHandlers';

import useCurrRef from './useCurrRef';

export type PeerMediaConnEventHandlers = GetEventHandlers<{
  close: () => void;
  error: (error: PeerError<'negotiation-failed' | 'connection-closed'>) => void;
  iceStateChanged: (state: RTCIceConnectionState) => void;
  stream: (stream: MediaStream) => void;
  willCloseOnRemote: () => void;
  message: (data: unknown) => void;
}>;

interface Options extends Partial<PeerMediaConnEventHandlers> {
  onCallRejected?: () => void;
}

const usePeerMediaConnection = (
  mediaConn: MediaConnection | null,
  options: Options = {}
) => {
  const {
    onClose,
    onError,
    onIceStateChanged,
    onStream,
    onWillCloseOnRemote,
    onMessage,
  } = options;
  const [state, setState] = useState<RTCIceConnectionState>('new');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isConnectedRef = useCurrRef(state === 'connected');
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const send = useMemo(() => {
    if (!dataChannel) {
      return null;
    }

    return (
      ...args: Parameters<NonNullable<typeof mediaConn>['dataChannel']['send']>
    ) => {
      dataChannel.send(...args);
    };
  }, [dataChannel]);

  useEffect(() => {
    if (!mediaConn) {
      return;
    }

    const selfId = mediaConn.provider.id;

    mediaConn
      .on('close', () => {
        console.log(`<${selfId}>[mConn] close`);
        setState('closed');
      })
      .on('error', error => {
        console.warn(`<${selfId}>[mConn] error`, error);
      })
      .on('iceStateChanged', state => {
        console.log(`<${selfId}>[mConn] iceStateChanged`, state);
        setState(state);
      })
      .on('stream', newStream => {
        console.log(`<${selfId}>[mConn] stream`, newStream);
        setStream(newStream);
      })
      .on('willCloseOnRemote', () => {
        console.log(`<${selfId}>[mConn] willCloseOnRemote`);
      });

    let aborted = false;

    const checkDataChannel = () => {
      if (aborted) {
        return;
      }

      const { dataChannel } = mediaConn;

      if (dataChannel) {
        setDataChannel(dataChannel);
        dataChannel.addEventListener('message', event => {
          console.log(`<${selfId}>[mConn][dChan] message`, event.data, event);
        });
      } else {
        setTimeout(() => {
          checkDataChannel();
        }, 1000);
      }
    };

    checkDataChannel();

    return () => {
      aborted = true;
      setDataChannel(null);
      mediaConn.close();
    };
  }, [isConnectedRef, mediaConn]);

  useEffect(() => {
    if (mediaConn && onClose) {
      mediaConn.on('close', onClose);

      return () => {
        mediaConn.off('close', onClose);
      };
    }
  }, [onClose, mediaConn]);

  useEffect(() => {
    if (mediaConn && onError) {
      mediaConn.on('error', onError);

      return () => {
        mediaConn.off('error', onError);
      };
    }
  }, [onError, mediaConn]);

  useEffect(() => {
    if (mediaConn && onIceStateChanged) {
      mediaConn.on('iceStateChanged', onIceStateChanged);

      return () => {
        mediaConn.off('iceStateChanged', onIceStateChanged);
      };
    }
  }, [onIceStateChanged, mediaConn]);

  useEffect(() => {
    if (mediaConn && onStream) {
      mediaConn.on('stream', onStream);

      return () => {
        mediaConn.off('stream', onStream);
      };
    }
  }, [onStream, mediaConn]);

  useEffect(() => {
    if (mediaConn && onWillCloseOnRemote) {
      mediaConn.on('willCloseOnRemote', onWillCloseOnRemote);

      return () => {
        mediaConn.off('willCloseOnRemote', onWillCloseOnRemote);
      };
    }
  }, [onWillCloseOnRemote, mediaConn]);

  useEffect(() => {
    if (dataChannel && onMessage) {
      const handleMessage = (event: MessageEvent) => {
        onMessage(event.data);
      };

      dataChannel.addEventListener('message', handleMessage);

      return () => {
        dataChannel.removeEventListener('message', handleMessage);
      };
    }
  }, [dataChannel, onMessage]);

  return {
    state,
    stream,
    send,
  };
};

export default usePeerMediaConnection;
