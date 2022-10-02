import classnames from 'classnames';
import React, { FunctionComponent, MouseEventHandler, PropsWithChildren } from 'react';

import Clickable from '../Clickable';
import Frame from '../Frame';
import Video from '../Video';
import styles from './styles.module.scss';

interface CameraViewProps {
  majorStream?: MediaStream;
  minorStream?: MediaStream;
  onClickMinor?: MouseEventHandler;
  onPhoto?: () => void;
}

const CameraView: FunctionComponent<PropsWithChildren<CameraViewProps>> = ({
  majorStream,
  minorStream,
  onClickMinor,
  onPhoto,
  children,
}) => (
  <Frame className={styles.view}>
    <Video
      className={classnames(styles.stream, styles.major)}
      srcObject={majorStream}
    />
    <Clickable onClick={onClickMinor}>
      <Video
        className={classnames(styles.stream, styles.minor)}
        srcObject={minorStream}
      />
    </Clickable>
    <Clickable onClick={onPhoto}>
      <div className={styles.shutter} />
    </Clickable>
    {children}
  </Frame>
);

export default CameraView;
