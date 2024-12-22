import type { ComponentType, MouseEventHandler, ReactNode } from 'react';

export interface OverlayContentProps<V> {
  closeOverlay: (result: V | void) => void;
  hoistOverlay: () => void;
}

export type OverlayContentFn<V> = ComponentType<OverlayContentProps<V>>;

export interface OverlayOption<P = never> {
  id?: string;
  closeOnBackdrop?: boolean;
  outsideThrough?: boolean;
  onClickOutside?: MouseEventHandler;
  props?: P;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OverlayContentResolve<C extends OverlayContentFn<any> | ReactNode> =
  C extends OverlayContentFn<infer V> ? V : never;
