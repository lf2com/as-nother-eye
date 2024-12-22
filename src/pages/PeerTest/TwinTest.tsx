import type { FC } from 'react';

import TwinPanels from './TwinPanels';

const TwinTest: FC = () => (
  <TwinPanels routeA="/catcher/pt-a" routeB="/viewer/pt-b" />
);

export default TwinTest;
