import Peer from 'peerjs';

import Logger from '../logger';
import randomStr from '../random';

export class RemoteConnection {
  protected selfId: string;

  protected logger: Logger;

  protected selfIsOnline = false;

  protected selfPeer?: Peer;

  constructor(id: string = randomStr()) {
    this.selfId = id;
    this.logger = new Logger({
      tag: `RC<${id}>`,
    });
  }

  get peer() { return this.selfPeer; }

  get id() { return this.selfId; }

  get isOnline() { return this.selfIsOnline; }
}

export default RemoteConnection;
