import type { FC, PropsWithChildren } from 'react';
import React from 'react';

import WithTextShadow from '@/components/WithTextShadow';

const Tag: FC<PropsWithChildren> = ({ children }) => (
  <div className="p-[0.5em] text-[1rem] text-black">
    <WithTextShadow>{children}</WithTextShadow>
  </div>
);

export default Tag;
