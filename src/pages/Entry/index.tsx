import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { DoubleBtnModal } from '@/components/common/Modal';
import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import useMount from '@/hooks/useMount';

const Entry: FC = () => {
  const { open } = useOverlayContext();
  const navigate = useNavigate();

  useMount(() => {
    open(
      <DoubleBtnModal
        btnAContent="Catcher"
        btnBContent="Viewer"
        onClickA={() => {
          navigate('/catcher');
        }}
        onClickB={() => {
          navigate('/viewer');
        }}
      >
        Choose photo mode
      </DoubleBtnModal>
    );
  });

  return null;
};

export default Entry;
