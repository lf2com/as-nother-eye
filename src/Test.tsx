import React, { FunctionComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import randomStr from './utils/random';

const IframeElem = styled.iframe`
  margin: 1rem;
  width: 30vw;
  height: calc(30vw * 16 / 10);
  border: 1px solid #333;
`;

const Test: FunctionComponent = () => {
  const [searchParams] = useSearchParams();
  const cameraId = searchParams.get('camera') ?? randomStr();
  const photoerId = searchParams.get('photoer') ?? randomStr();

  return (
    <div>
      <IframeElem src={`/photoer/${cameraId}?id=${photoerId}`} />
      <IframeElem src={`/camera/?id=${cameraId}`} />
    </div>
  );
};

export default Test;
