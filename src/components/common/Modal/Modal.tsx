import type { FC, PropsWithChildren, ReactNode } from 'react';

import twClassNames from '@/utils/twClassNames';

export interface ModalBaseProps extends PropsWithChildren {
  className?: string;
  header?: ReactNode;
  headerClassName?: string;
  onCloseButton?: () => void;
}

interface ModalProps extends ModalBaseProps {
  footer?: ReactNode;
  footerClassName?: string;
}

const Modal: FC<ModalProps> = ({
  className,
  headerClassName,
  footerClassName,
  children,
  header,
  footer,
  onCloseButton,
}) => (
  <div
    className={twClassNames(
      'relative max-w-[85%] max-h-[85%] bg-gray-300',
      'flex flex-col justify-center gap-px',
      'border border-gray-500 rounded-md overflow-hidden'
    )}
  >
    {!!header && (
      <div
        className={twClassNames('shrink-0 bg-white text-sm', headerClassName)}
      >
        {header}
      </div>
    )}
    <div
      className={twClassNames('shrink p-4 bg-white overflow-auto', className)}
    >
      {children}
    </div>
    {!!footer && (
      <div
        className={twClassNames(
          'shrink-0 grid gap-px text-xs',
          footerClassName
        )}
      >
        {footer}
      </div>
    )}
    {onCloseButton && (
      <div
        className={twClassNames(
          'absolute top-0 right-0 w-[1rem] h-[1rem] text-sm',
          'flex justify-center items-center font-[monospace]'
        )}
        onClick={onCloseButton}
      >
        x
      </div>
    )}
  </div>
);

export default Modal;
