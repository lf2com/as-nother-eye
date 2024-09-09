import type { ComponentProps, FC } from 'react';

import Clickable from '@/components/Clickable';
import twClassNames from '@/utils/twClassNames';

interface ModalButtonProps extends ComponentProps<typeof Clickable> {}

const ModalButton: FC<ModalButtonProps> = ({
  className,
  disabled,
  ...restProps
}) => (
  <Clickable
    {...restProps}
    disabled={disabled}
    className={twClassNames(
      'px-2 py-1 bg-white truncate',
      {
        'text-gray-300': disabled,
        'hover:brightness-[0.975]': !disabled,
      },
      className
    )}
  />
);

export default ModalButton;
