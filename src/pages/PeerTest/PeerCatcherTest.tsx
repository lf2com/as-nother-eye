import type { FC } from 'react';

import TwinPanels from './TwinPanels';

const PeerCatcherTest: FC = () => (
  <TwinPanels routeA="/peer-test/pt-a" routeB="/catcher/pt-b" />
);

export default PeerCatcherTest;
