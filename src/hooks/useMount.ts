import { useEffect } from 'react';

const useMount = (fn: Parameters<typeof useEffect>[0]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(fn, []);
};

export default useMount;
