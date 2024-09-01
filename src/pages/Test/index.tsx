import type { FC } from 'react';
import React from 'react';

import Logger from '@/utils/logger';
import randomStr from '@/utils/random';

import styles from './styles.module.scss';

const logger = new Logger({
  tag: '[Test]',
});

const photoerId = randomStr();
const cameraId = randomStr();

const Test: FC = () => {
  const leftUrl = `/photoer/${cameraId}?id=${photoerId}`;
  const rightUrl = `/camera?id=${cameraId}`;

  logger.log({
    photoerId,
    cameraId,
  });

  return (
    <div>
      <iframe className={styles['inner-view']} src={leftUrl} />
      <iframe className={styles['inner-view']} src={rightUrl} />
    </div>
  );
};

export default Test;
