import type { FC, PropsWithChildren } from 'react';
import React from 'react';

const Tag: FC<PropsWithChildren> = ({ children }) => (
  <div className="p-[0.5em] text-[1rem] text-black text-shadow-white">
    {children}
  </div>
);

export default Tag;
