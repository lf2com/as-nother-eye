import { type ComponentProps, type FC, useState } from 'react';

import { SingleBtnModal } from '@/components/common/Modal';
import type { OverlayContentProps } from '@/contexts/OverlayProvider/types';

import DeviceTypes from './DeviceTypes';

const DeviceTypeModal: FC<
  OverlayContentProps<Required<ComponentProps<typeof DeviceTypes>>['type']>
> = ({ closeOverlay }) => {
  const [deviceType, setDeviceType] =
    useState<ComponentProps<typeof DeviceTypes>['type']>();

  return (
    <SingleBtnModal
      disabled={!deviceType}
      className="p-4 pb-8 flex flex-col gap-4"
      onClick={() => deviceType && closeOverlay(deviceType)}
    >
      What is this device?
      <DeviceTypes type={deviceType} onChange={setDeviceType} />
    </SingleBtnModal>
  );
};

export default DeviceTypeModal;
