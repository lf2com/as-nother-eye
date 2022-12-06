import { FunctionComponent, PropsWithChildren } from 'react';

export type PropsWithClassName<P = unknown> = P & { className?: string };

export type FunctionComponentWithChildren<P = {}> = FunctionComponent<PropsWithChildren<P>>;
export type FCWithChildren<P = {}> = FunctionComponentWithChildren<P>;

export type FunctionComponentWithClassName<P = {}> = FunctionComponent<PropsWithClassName<P>>;
export type FCWithClassName<P = {}> = FunctionComponentWithClassName<P>;

export type FunctionComponentWithClassNameAndChildren<P = {}> = (
  FunctionComponent<PropsWithChildren<PropsWithClassName<P>>>
);
export type FCWithClassNameAndChildren<P = {}> = FunctionComponentWithClassNameAndChildren<P>;
