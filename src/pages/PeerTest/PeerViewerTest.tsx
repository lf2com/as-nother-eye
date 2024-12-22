import type { FC } from 'react';

import TwinPanels from './TwinPanels';

const PeerViewerTest: FC = () => (
  <TwinPanels routeA="/peer-test/pt-a" routeB="/viewer/pt-b" />
);

export default PeerViewerTest;
