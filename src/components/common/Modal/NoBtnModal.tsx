import type { FC, PropsWithChildren } from 'react';

import Modal from './Modal';

const NoBtnModal: FC<PropsWithChildren> = ({ children }) => (
  <Modal>{children}</Modal>
);

export default NoBtnModal;
