import { FC, PropsWithChildren } from 'react';

export type PropsWithClassName<P = unknown> = P & { className?: string };

export type FCWithChildren<P = {}> = FC<PropsWithChildren<P>>;

export type FCWithClassName<P = {}> = FC<PropsWithClassName<P>>;

export type FCWithClassNameAndChildren<P = {}> = (
  FCWithChildren<PropsWithClassName<P>>
);
