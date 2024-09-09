import type { ComponentType, MouseEventHandler, ReactNode } from 'react';

export type CloseOverlayFn<V> = (result: V | void) => void;
export type HoistOverlayFn = () => void;

export interface OverlayContentProps<V> {
  closeOverlay: CloseOverlayFn<V>;
  hoistOverlay: HoistOverlayFn;
}

export type OverlayContentFn<V> = ComponentType<OverlayContentProps<V>>;

export interface OverlayOption {
  id?: string;
  closeOnBackdrop?: boolean;
  outsideThrough?: boolean;
  onClickOutside?: MouseEventHandler;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OverlayContentResolve<C extends OverlayContentFn<any> | ReactNode> =
  (C extends OverlayContentFn<infer V> ? V : never) | void;
