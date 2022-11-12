import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import Logger from './utils/logger';
import randomStr from './utils/random';

const IframeElem = styled.iframe`
  margin: 1rem;
  width: 30vw;
  height: calc(30vw * 16 / 10);
  border: 1px solid #333;
`;

const logger = new Logger({
  tag: '[Test]',
});

const photoerId = randomStr();
const cameraId = randomStr();

const Test: FunctionComponent = () => {
  const leftUrl = `/photoer/${cameraId}?id=${photoerId}`;
  const rightUrl = `/camera?id=${cameraId}`;

  logger.log({ photoerId, cameraId });

  return (
    <div>
      <IframeElem src={leftUrl} />
      <IframeElem src={rightUrl} />
    </div>
  );
};

export default Test;
