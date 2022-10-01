import Peer from 'peerjs';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import randomStr from '../utils/random';

interface UsePeerProps {
  id?: string;
  onLog?: Required<ConstructorParameters<typeof Peer>>['1']['logFunction'];
}

const usePeer = ({
  id,
  onLog,
}: UsePeerProps = {}) => {
  const [searchParams] = useSearchParams();
  const [opened, setOpened] = useState(false);
  const [peerId, setPeerId] = useState<string>();

  const peer = useMemo(() => (
    new Peer(
      id ?? searchParams.get('id') ?? randomStr(),
      {
        logFunction: onLog,
      },
    )
  ), [id, searchParams, onLog]);

  useEffect(() => {
    peer.once('open', (finalPeerId) => {
      setPeerId(finalPeerId);
      setOpened(true);
    });

    return () => {
      if (peer) {
        peer.disconnect();
        peer.destroy();
      }
    };
  }, [peer]);

  return { peer, opened, peerId };
};

export default usePeer;
