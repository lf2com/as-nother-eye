import type { FC, PropsWithChildren } from 'react';
import React from 'react';

const WithTextShadow: FC<PropsWithChildren> = ({ children }) => (
  <span className="text-shadow-white">{children}</span>
);

export default WithTextShadow;
