import type { FC, ReactNode } from 'react';

import Clickable from '@/components/Clickable';
import twClassNames from '@/utils/twClassNames';

type DeviceType = 'shutter' | 'lens';

interface DeviceTypesProps {
  type?: DeviceType;
  onChange: (type: DeviceType) => void;
}

const TYPES: Array<{
  type: DeviceType;
  content: ReactNode;
}> = [
  {
    type: 'shutter',
    content: 'Shutter',
  },
  {
    type: 'lens',
    content: 'Lens',
  },
];

const DeviceTypes: FC<DeviceTypesProps> = ({ type: currType, onChange }) => (
  <div className="grid grid-cols-2 gap-px border border-cyan-500 rounded-md bg-cyan-500 overflow-hidden">
    {TYPES.map(({ type, content }) => (
      <Clickable
        key={type}
        className={twClassNames(
          'px-2 py-1 flex justify-center items-center bg-white text-cyan-500',
          { ' text-white bg-transparent': type === currType }
        )}
        onClick={() => onChange(type)}
      >
        {content}
      </Clickable>
    ))}
  </div>
);

export default DeviceTypes;
