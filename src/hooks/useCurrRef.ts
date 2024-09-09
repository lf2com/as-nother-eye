import { useRef } from 'react';

const useCurrRef = <T>(value: T) => {
  const ref = useRef<T>(value);

  ref.current = value;

  return ref;
};

export default useCurrRef;
