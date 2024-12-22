import type { ComponentProps, FC } from 'react';
import { useEffect, useRef } from 'react';

interface CheckboxWithIndeterminateProps
  extends Omit<ComponentProps<'input'>, 'type'> {
  indeterminate: boolean;
}

const CheckboxWithIndeterminate: FC<CheckboxWithIndeterminateProps> = ({
  indeterminate,
  ...restProps
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return <input {...restProps} ref={ref} type="checkbox" />;
};

export default CheckboxWithIndeterminate;
