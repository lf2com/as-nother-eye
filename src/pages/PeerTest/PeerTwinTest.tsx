import type { FC } from 'react';

import TwinPanels from './TwinPanels';

const PeerTwinTest: FC = () => (
  <TwinPanels routeA="/peer-test/pt-a" routeB="/peer-test/pt-b" />
);

export default PeerTwinTest;
