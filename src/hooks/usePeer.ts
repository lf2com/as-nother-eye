import type { MediaConnection, PeerEvents } from 'peerjs';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';

import type GetEventHandlers from '@/types/GetEventHandlers';

import type { PeerMediaConnEventHandlers } from './usePeerMediaConnection';

export type PeerEventHandlers = GetEventHandlers<PeerEvents>;

type Options = Partial<PeerEventHandlers>;

class CustomPeer extends Peer {
  callPromise(...args: Parameters<Peer['call']>): Promise<{
    mediaConnection: MediaConnection;
    stream: MediaStream;
  }> {
    const mediaConn = super.call.apply(this, args);

    return new Promise((resolve, reject) => {
      const end = () => {
        mediaConn.off('stream', onStream);
        mediaConn.off('willCloseOnRemote', onWillCloseOnRemote);
        this.off('error', onError);
      };

      const onStream: PeerMediaConnEventHandlers['onStream'] = stream => {
        resolve({
          mediaConnection: mediaConn,
          stream,
        });
        end();
      };

      const onWillCloseOnRemote: PeerMediaConnEventHandlers['onWillCloseOnRemote'] =
        () => {
          reject();
          end();
        };

      const onError: PeerEventHandlers['onError'] = error => {
        reject(error);
        end();
      };

      this.on('error', onError);
      mediaConn.on('stream', onStream);
      mediaConn.on('willCloseOnRemote', onWillCloseOnRemote);
    });
  }
}

const usePeer = (id: string, options: Options = {}) => {
  const { onCall, onClose, onConnection, onDisconnected, onError, onOpen } =
    options;
  const [peer, setPeer] = useState<CustomPeer | null>(null);

  useEffect(() => {
    const newPeer = new CustomPeer(id);
    const handleOpen: PeerEventHandlers['onOpen'] = () => {
      newPeer.off('open', handleOpen);
      setPeer(newPeer);
    };

    newPeer.on('open', handleOpen);

    newPeer
      .on('open', cid => {
        console.log(`<${id}>[peer] open`, cid);
      })
      .on('error', error => {
        console.warn(`<${id}>[peer] error`, error);
      })
      .on('call', mediaConn => {
        console.log(`<${id}>[peer] call`, mediaConn);
      })
      .on('connection', dataConn => {
        console.log(`<${id}>[peer] connection`, dataConn);
      })
      .on('disconnected', id => {
        console.warn(`<${id}>[peer] disconnected`, id);
      });
  }, [id]);

  useEffect(() => {
    if (peer && onCall) {
      peer.on('call', onCall);

      return () => {
        peer.off('call', onCall);
      };
    }
  }, [onCall, peer]);

  useEffect(() => {
    if (peer && onClose) {
      peer.on('close', onClose);

      return () => {
        peer.off('close', onClose);
      };
    }
  }, [onClose, peer]);

  useEffect(() => {
    if (peer && onConnection) {
      peer.on('connection', onConnection);

      return () => {
        peer.off('connection', onConnection);
      };
    }
  }, [onConnection, peer]);

  useEffect(() => {
    if (peer && onDisconnected) {
      peer.on('disconnected', onDisconnected);

      return () => {
        peer.off('disconnected', onDisconnected);
      };
    }
  }, [onDisconnected, peer]);

  useEffect(() => {
    if (peer && onError) {
      peer.on('error', onError);

      return () => {
        peer.off('error', onError);
      };
    }
  }, [onError, peer]);

  useEffect(() => {
    if (peer && onOpen) {
      peer.on('open', onOpen);

      return () => {
        peer.off('open', onOpen);
      };
    }
  }, [onOpen, peer]);

  useEffect(() => {
    if (peer) {
      return () => {
        peer.disconnect();
        peer.destroy();
      };
    }
  }, [peer]);

  return peer;
};

export default usePeer;
