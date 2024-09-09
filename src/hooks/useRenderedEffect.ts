import { useEffect } from 'react';

const useRenderedEffect = (...[fn, deps]: Parameters<typeof useEffect>) => {
  return useEffect(() => {
    const tid = setTimeout(fn);

    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);
};

export default useRenderedEffect;
