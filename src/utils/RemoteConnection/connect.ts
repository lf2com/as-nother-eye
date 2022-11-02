import Peer, { DataConnection, MediaConnection } from 'peerjs';

import './event';
import { RemoteConnection } from './base';

interface ConnectionItem {
  dataConnection: DataConnection;
  mediaConnection?: MediaConnection;
}

declare module './base' {
  interface RemoteConnection {
    connectionList: Record<string, ConnectionItem>;

    connect(targetId?: string): Promise<void>;
    disconnect(targetId?: string): void;
    sendMessage(targetId: string, message: string): Promise<void>;
    sendFile(targetId: string, file: Blob | File): Promise<void>;
    call(targetId: string, stream: MediaStream): Promise<MediaStream>;
  }
}

function createDataConnection(
  this: RemoteConnection,
  dataConnection: DataConnection,
): Promise<void> {
  const targetId = dataConnection.peer;

  return new Promise((resolve, reject) => {
    dataConnection.off('open');
    dataConnection.on('open', () => {
      this.logger.log('Data connection open');
      this.connectionList[targetId] = { dataConnection };
      this.dispatchEvent('connecteddata', targetId, dataConnection);
      resolve();
    });

    dataConnection.off('iceStateChanged');
    dataConnection.on('iceStateChanged', (state) => {
      this.logger.log('Data connection iceStateChanged', state);
    });

    dataConnection.off('error');
    dataConnection.on('error', (error) => {
      this.logger.warn('Data connection error', error);
      delete this.connectionList[targetId];
      reject(error);
    });

    dataConnection.off('data');
    dataConnection.on('data', (data) => {
      this.logger.log('Data connection data', data);
      this.dispatchEvent('data', targetId, data);
    });

    dataConnection.off('close');
    dataConnection.on('close', () => {
      this.logger.log('Data connection close');
      delete this.connectionList[targetId];
    });
  });
}

function createMediaConnection(
  this: RemoteConnection,
  mediaConnection: MediaConnection,
): Promise<MediaStream> {
  const targetId = mediaConnection.peer;

  return new Promise((resolve, reject) => {
    mediaConnection.off('stream');
    mediaConnection.on('stream', (remoteStream) => {
      this.logger.log('Peer call connection stream', remoteStream);
      this.connectionList[targetId].mediaConnection = mediaConnection;
      this.dispatchEvent('connectedmedia', targetId, mediaConnection);
      resolve(remoteStream);
    });

    mediaConnection.off('iceStateChanged');
    mediaConnection.on('iceStateChanged', (state) => {
      this.logger.log('Peer call connection iceStateChanged', state);
    });

    mediaConnection.off('error');
    mediaConnection.on('error', (error) => {
      this.logger.warn('Peer call connection error', error);
      delete this.connectionList[targetId].mediaConnection;
      reject(error);
    });

    mediaConnection.off('close');
    mediaConnection.on('close', () => {
      this.logger.log('Peer call connection close');
      delete this.connectionList[targetId].mediaConnection;
      this.dispatchEvent('hangup', targetId, mediaConnection.metadata);
    });
  });
}

/**
 * Connect
 */
RemoteConnection.prototype.connect = function f(
  this: RemoteConnection,
  targetId,
) {
  return new Promise((resolve, reject) => {
    if (this.peer && this.isOnline) {
      resolve(undefined);
      return;
    }

    const peer = new Peer(this.id);

    this.disconnect();

    peer.off('open');
    peer.on('open', (currentId) => {
      this.selfPeer = peer;
      this.selfId = currentId;
      this.selfIsOnline = true;
      this.dispatchEvent('online');
      resolve(undefined);
    });

    peer.off('error');
    peer.on('error', (error) => {
      this.logger.warn('Peer error', error);
      reject(error);
    });

    peer.off('disconnected');
    peer.on('disconnected', () => {
      this.logger.log('Peer disconnected');
      this.selfIsOnline = false;
      this.connectionList = {};
      this.dispatchEvent('offline');
    });

    peer.off('connection');
    peer.on('connection', (dataConnection) => {
      this.logger.log('Peer connection', dataConnection);
      createDataConnection.call(this, dataConnection);
    });
    peer.off('close');
    peer.on('close', () => {
      this.logger.log('Peer close');
      this.selfIsOnline = false;
      this.connectionList = {};
      this.dispatchEvent('offline');
    });

    peer.off('call');
    peer.on('call', (mediaConnection) => {
      const {
        peer: sourceId,
        metadata,
        answer,
      } = mediaConnection;

      this.logger.log('Peer call', mediaConnection);
      this.dispatchEvent(
        'call',
        sourceId,
        (accept, stream) => {
          if (!accept) {
            mediaConnection.answer();
            mediaConnection.close();
            return Promise.resolve();
          }

          answer.call(mediaConnection, stream);

          return createMediaConnection.call(this, mediaConnection);
        },
        metadata,
      );
    });
  })
    .then(() => new Promise((resolve, reject) => {
      if (targetId === undefined || this.connectionList[targetId]) {
        resolve(undefined);
        return;
      }

      const peer = this.selfPeer!;

      peer.off('error');
      peer.on('error', (error) => {
        this.logger.warn('Peer error', error);
        reject(error);
      });

      const dataConnection = peer.connect(targetId);

      resolve(createDataConnection.call(this, dataConnection));
    }))
    .then(() => console.log(100))
    .catch((e) => console.warn(110, e));
};

/**
 * Disconnect
 */
RemoteConnection.prototype.disconnect = function f(
  this: RemoteConnection,
  targetId,
) {
  if (targetId === undefined) {
    const peer = this.selfPeer;

    if (peer) {
      peer.disconnect();
      peer.destroy();
    }

    this.selfPeer = undefined;
    this.selfIsOnline = false;
    this.connectionList = {};
    this.dispatchEvent('offline');

    return;
  }

  const connection = this.connectionList[targetId];

  if (connection) {
    const { dataConnection, mediaConnection } = connection;

    dataConnection.close();
    mediaConnection?.close();
  }
};

/**
 * Send message
 */
RemoteConnection.prototype.sendMessage = function f(
  this: RemoteConnection,
  targetId,
  message,
) {
  return this.connect(targetId)
    .then(() => {
      this.connectionList[targetId].dataConnection.send(message);
    });
};

/**
 * Send file
 */
RemoteConnection.prototype.sendFile = function f(
  this: RemoteConnection,
  targetId,
  file,
) {
  return this.connect(targetId)
    .then(() => {
      const { dataConnection } = this.connectionList[targetId];

      this.logger.log('Send file', file, dataConnection);
      dataConnection.send(file);
    });
};

/**
 * Call
 */
RemoteConnection.prototype.call = function f(
  this: RemoteConnection,
  targetId,
  stream,
) {
  return this.connect(targetId)
    .then(() => {
      const mediaConnection = this.peer!.call(targetId, stream);

      return createMediaConnection.call(this, mediaConnection);
    });
};
