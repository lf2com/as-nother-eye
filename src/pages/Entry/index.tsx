import type { FC } from 'react';

import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import useMount from '@/hooks/useMount';

import DeviceTypeModal from './DeviceTypeModal';

const Entry: FC = () => {
  const { open } = useOverlayContext();

  useMount(() => {
    open(DeviceTypeModal, {
      id: 'device-type',
      closeOnBackdrop: false,
    }).then(type => {
      // TODO: switch to pages
      console.log('device type:', type);
    });
  });

  return (
    <div className="w-full h-full bg-slash bg-slash-fg-gray-200 bg-size-[0.5rem] animate-bg-slide" />
  );
};

export default Entry;
