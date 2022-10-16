import Peer from 'peerjs';

import randomStr from './random';

interface RemoteConnectionOptions {
  id?: string;
  connect?: boolean;
}

interface RemoteConnectionEventCallback {
  call: (
    sourceId: string,
    answer: (accept: boolean, stream?: MediaStream) => Promise<MediaStream | void>,
    metadata?: unknown,
  ) => void;
  hangup: (sourceId: string, metadata?: unknown) => void;
}

type RemoteConnectionEvent = keyof RemoteConnectionEventCallback;

interface RemoteConnectionEventPoolItem<F> {
  callback: F;
  once: boolean;
}

type RemoteConnectionEventPool = Partial<Record<
  keyof RemoteConnectionEventCallback,
  RemoteConnectionEventPoolItem<
    RemoteConnectionEventCallback[keyof RemoteConnectionEventCallback]
  >[]
>>

class RemoteConnection {
  protected selfId: string;

  protected peer: Peer | null = null;

  protected opened: boolean = false;

  private eventListeners: RemoteConnectionEventPool = {};

  constructor(options?: RemoteConnectionOptions) {
    const {
      id = randomStr(),
      connect = true,
    } = options ?? {};

    this.selfId = id;

    if (connect) {
      this.connectToServer();
    }
  }

  get id() { return this.selfId; }

  get isOnline() { return this.opened; }

  /**
   * Adds event listener.
   */
  addEventListener<E extends RemoteConnectionEvent>(
    eventName: E,
    callback: RemoteConnectionEventCallback[E],
    options?: { once?: boolean },
  ): void {
    const listeners = this.eventListeners[eventName] ?? [];

    if (!listeners.find((item) => item.callback === callback)) {
      this.eventListeners[eventName] = [
        ...listeners,
        {
          callback,
          once: options?.once ?? false,
        },
      ];
    }
  }

  /**
   * Removes event listener.
   */
  removeEventListener<E extends RemoteConnectionEvent>(
    eventName: E,
    callback: RemoteConnectionEventCallback[E],
  ): void {
    const listeners = this.eventListeners[eventName] ?? [];
    const index = listeners.findIndex((item) => item.callback === callback);

    if (index !== -1) {
      this.eventListeners[eventName] = listeners
        .slice(0, index)
        .concat(listeners.slice(index + 1));
    }
  }

  /**
   * Dispatches event.
   */
  protected dispatchEvent<E extends keyof RemoteConnectionEventCallback>(
    eventName: E,
    ...args: Parameters<RemoteConnectionEventCallback[E]>
  ): void {
    const listeners = this.eventListeners[eventName] ?? [];

    this.eventListeners[eventName] = listeners.filter((item) => {
      const { callback, once } = item;

      callback.apply(this, args as any);

      return !once;
    });
  }

  /**
   * Connects to server with specific ID.
   */
  async connectToServer(): Promise<RemoteConnection> {
    if (this.peer) {
      this.peer.off('error');
      this.peer.off('open');

      if (this.opened) {
        return this;
      }

      this.opened = false;
      this.peer.reconnect();
    }

    this.opened = false;

    return new Promise((resolveConnect, rejectConnect) => {
      const peer = new Peer(this.id);

      peer.on('error', (error) => {
        console.warn('Peer error', error);

        rejectConnect(error);
      });

      peer.on('close', () => {
        console.warn('Peer close');
        this.disconnectFromServer();
      });

      peer.on('disconnected', () => {
        console.warn('Peer disconnected');
        this.disconnectFromServer();
      });

      peer.on('open', (peerId) => {
        console.log('Peer open', peerId);
        this.opened = true;
        this.peer = peer;

        peer.on('call', async (connection) => {
          console.log('Connection call', connection);
          const {
            peer: sourceId,
          } = connection;

          this.dispatchEvent('call', sourceId, async (accept, localStream) => {
            if (!accept) {
              connection.close();
              connection.peerConnection.close();

              return undefined;
            }

            return new Promise<MediaStream>((resolveAnswer, rejectAnswer) => {
              connection.on('error', (error) => {
                console.warn('Connection error', error);
                rejectAnswer(error);
              });

              connection.on('stream', (remoteStream) => {
                console.log('Connection stream', remoteStream);
                resolveAnswer(remoteStream);
              });

              connection.answer(localStream);
            });
          });

          connection.on('close', () => {
            console.warn('Connection close');
          });

          connection.on('iceStateChanged', (state) => {
            console.log('Connection state changed', state);
          });
        });

        resolveConnect(this);
      });
    });
  }

  /**
   * Disconnects from server.
   */
  async disconnectFromServer(): Promise<void> {
    if (this.peer) {
      this.peer.disconnect();
      this.peer.destroy();
    }

    this.opened = false;
  }

  /**
   * Calls target peer by ID.
   */
  async call(targetId: string, mediaStream: MediaStream): Promise<MediaStream> {
    await this.connectToServer();

    const peer = this.peer as Peer;

    await new Promise<void>((resolve, reject) => {
      console.log('Connecting to', targetId);
      const connection = peer.connect(targetId);

      connection.on('close', () => {
        this.dispatchEvent('hangup', targetId);
      });

      connection.on('data', (data) => {
        console.log('My connection data', data);
      });

      connection.on('error', (error) => {
        console.warn('My connection error', error);
        reject(error);
      });

      connection.on('iceStateChanged', (state) => {
        console.warn('My connection state changed', state);
      });

      connection.on('open', () => {
        console.warn('My connection open');
        resolve();
      });
    });

    const connection = peer.call(targetId, mediaStream);

    return new Promise((resolve, reject) => {
      connection.on('error', (error) => {
        console.warn('My call error', error);
        reject(error);
      });

      connection.on('close', () => {
        this.dispatchEvent('hangup', targetId);
      });

      connection.on('stream', (remoteStream) => {
        resolve(remoteStream);
      });

      connection.on('iceStateChanged', (state) => {
        console.warn('My call state changed', state);

        switch (state) {
          case 'connected':
          case 'new':
          case 'checking':
          case 'completed':
            break;

          case 'closed':
          case 'disconnected':
          case 'failed':
          default:
            reject(Error(state));
            break;
        }
      });
    });
  }
}

export default RemoteConnection;
