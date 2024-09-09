import type { FC, PropsWithChildren, ReactNode } from 'react';

import twClassNames from '@/utils/twClassNames';

export interface ModalBaseProps extends PropsWithChildren {
  className?: string;
}

interface ModalProps extends ModalBaseProps {
  footer?: ReactNode;
  footerClassName?: string;
}

const Modal: FC<ModalProps> = ({
  className,
  footerClassName,
  children,
  footer,
}) => (
  <div
    className={twClassNames(
      'flex flex-col justify-center bg-gray-300 gap-px',
      'border border-gray-500 rounded-md overflow-hidden'
    )}
  >
    <div className={twClassNames('px-2 py-1 bg-white', className)}>
      {children}
    </div>
    {!!footer && (
      <div className={twClassNames('grid gap-px text-xs', footerClassName)}>
        {footer}
      </div>
    )}
  </div>
);

export default Modal;
