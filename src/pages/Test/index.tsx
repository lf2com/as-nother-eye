import type { FC } from 'react';
import React from 'react';

import Logger from '@/utils/logger';
import randomStr from '@/utils/random';

const logger = new Logger({
  tag: '[Test]',
});

const photoerId = randomStr();
const cameraId = randomStr();
const className = 'm-[1rem] w-[30vw] h-[calc(30vw*16/10)] border border-black';

const Test: FC = () => {
  const leftUrl = `/photoer/${cameraId}?id=${photoerId}`;
  const rightUrl = `/camera?id=${cameraId}`;

  logger.log({
    photoerId,
    cameraId,
  });

  return (
    <div>
      <iframe className={className} src={leftUrl} />
      <iframe className={className} src={rightUrl} />
    </div>
  );
};

export default Test;
