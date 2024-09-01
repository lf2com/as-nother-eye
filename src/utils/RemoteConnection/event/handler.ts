import type { DataConnection, MediaConnection } from 'peerjs';

interface EventHandler {
  online: () => void;

  offline: () => void;

  connecteddata: (sourceId: string, connection: DataConnection) => void;

  connectedmedia: (sourceId: string, connection: MediaConnection) => void;

  call: (
    sourceId: string,
    answer: (
      accept: boolean,
      stream?: MediaStream
    ) => Promise<MediaStream | void>,
    metadata?: unknown
  ) => void;

  hangup: (sourceId: string, metadata?: unknown) => void;

  data: (sourceId: string, data: unknown) => void;
}

export type EventName = keyof EventHandler;

export default EventHandler;
