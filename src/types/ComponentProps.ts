import type { FC, PropsWithChildren } from 'react';

export type PropsWithClassName<P = unknown> = P & { className?: string };

export type FCWithChildren<P = unknown> = FC<PropsWithChildren<P>>;

export type FCWithClassName<P = unknown> = FC<PropsWithClassName<P>>;

export type FCWithClassNameAndChildren<P = unknown> = FCWithChildren<
  PropsWithClassName<P>
>;
