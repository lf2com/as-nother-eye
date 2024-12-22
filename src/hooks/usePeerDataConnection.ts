import type { DataConnection, PeerError } from 'peerjs';
import { useEffect, useState } from 'react';

import type GetEventHandlers from '@/types/GetEventHandlers';

type PeerDataConnEventHandlers = GetEventHandlers<{
  open: () => void;
  close: () => void;
  data: (data: unknown) => void;
  error: (
    error: PeerError<
      | 'not-open-yet'
      | 'message-too-big'
      | 'negotiation-failed'
      | 'connection-closed'
    >
  ) => void;
  iceStateChanged: (state: RTCIceConnectionState) => void;
}>;

type Options = Partial<PeerDataConnEventHandlers>;

const usePeerDataConnection = (
  dataConn: DataConnection | null,
  options: Options = {}
) => {
  const { onClose, onData, onError, onIceStateChanged, onOpen } = options;
  const selfId = dataConn?.provider.id;
  const [state, setState] = useState<RTCIceConnectionState>('new');

  useEffect(() => {
    if (!dataConn) {
      return;
    }

    dataConn
      .on('open', () => {
        console.log(`<${selfId}>[dConn] open`);
      })
      .on('close', () => {
        console.log(`<${selfId}>[dConn] close`);
      })
      .on('data', data => {
        console.log(`<${selfId}>[dConn] data`, data);
      })
      .on('error', error => {
        console.warn(`<${selfId}>[dConn] error`, error);
      })
      .on('iceStateChanged', state => {
        console.log(`<${selfId}>[dConn] iceStateChanged`, state);
        setState(state);
      });
  }, [dataConn, selfId]);

  useEffect(() => {
    if (dataConn && onClose) {
      dataConn.on('close', onClose);

      return () => {
        dataConn.off('close', onClose);
      };
    }
  }, [onClose, dataConn]);

  useEffect(() => {
    if (dataConn && onData) {
      dataConn.on('data', onData);

      return () => {
        dataConn.off('data', onData);
      };
    }
  }, [onData, dataConn]);

  useEffect(() => {
    if (dataConn && onError) {
      dataConn.on('error', onError);

      return () => {
        dataConn.off('error', onError);
      };
    }
  }, [onError, dataConn]);

  useEffect(() => {
    if (dataConn && onIceStateChanged) {
      dataConn.on('iceStateChanged', onIceStateChanged);

      return () => {
        dataConn.off('iceStateChanged', onIceStateChanged);
      };
    }
  }, [onIceStateChanged, dataConn]);

  useEffect(() => {
    if (dataConn && onOpen) {
      dataConn.on('open', onOpen);

      return () => {
        dataConn.off('open', onOpen);
      };
    }
  }, [onOpen, dataConn]);

  return state;
};

export default usePeerDataConnection;
