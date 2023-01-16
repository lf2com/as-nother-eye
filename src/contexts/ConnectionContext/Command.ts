export enum CommandType {
  switchCamera = 'switchCamera',
  switchingCamera = 'switchingCamera',
  flipCamera = 'flipCamera',
  flippingCamera = 'flippingCamera',
  takePhoto = 'takePhoto',
  takingPhoto = 'takingPhoto',
}

interface CommmadParameters<T extends CommandType, P> {
  type: T;
  param: P;
}

type SwitchCameraCommand = CommmadParameters<
  CommandType.switchCamera,
  'user' | 'environment' | 'next'
>;

type SwitchingCameraCommand = CommmadParameters<
  CommandType.switchingCamera,
  boolean
>;

export type FlipCameraCommand = CommmadParameters<
  CommandType.flipCamera,
  'horizontal' | 'vertical'
>;

type FlippingCameraCommand = CommmadParameters<
  CommandType.flippingCamera,
  boolean
>;

type TakePhotoCommand = CommmadParameters<
  CommandType.takePhoto,
  number
>;

type TakingPhotoCommand = CommmadParameters<
  CommandType.takingPhoto,
  boolean
>;

export type Command<T extends CommandType> = Extract<(
  | SwitchCameraCommand
  | SwitchingCameraCommand
  | FlipCameraCommand
  | FlippingCameraCommand
  | TakePhotoCommand
  | TakingPhotoCommand
), { type: T }>;

export type CommandListener<T extends CommandType> = (
  type: T,
  param: Command<T>['param'],
) => void;
