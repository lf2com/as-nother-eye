import { useEffect } from 'react';

const useMount = (fn: Parameters<typeof useEffect>[0]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
};

export const useUnmount = (fn: ReturnType<Parameters<typeof useMount>[0]>) => {
  useMount(() => fn);
};

export default useMount;
