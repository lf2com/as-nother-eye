import { renderHook } from '@testing-library/react';

import useMount, { useUnmount } from '../useMount';

describe('useMount', () => {
  const renderer = (...[fn]: Parameters<typeof useMount>) =>
    renderHook((...[newFn = fn]: Parameters<typeof useMount>) =>
      useMount(newFn)
    );

  it('should call fn once on render', () => {
    const fn = jest.fn();

    renderer(fn);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call fn again if rerender', () => {
    const fn = jest.fn();

    renderer(fn).rerender(fn);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call fn again if unmount', () => {
    const fn = jest.fn();

    renderer(fn).unmount();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call any fn if fn change', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    renderer(fn1).rerender(fn2);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();
  });
});

describe('useUnmount', () => {
  const renderer = (...args: Parameters<typeof useUnmount>) =>
    renderHook(() => useUnmount(...args));

  it('should not call fn if render', () => {
    const fn = jest.fn();

    renderer(fn);

    expect(fn).not.toHaveBeenCalled();

    const { unmount } = renderer(fn);

    unmount();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call fn once on unmount', () => {
    const fn = jest.fn();

    renderer(fn).unmount();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call fn if rerender', () => {
    const fn = jest.fn();

    renderer(fn).rerender(fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should call fn once on unmount after rerender', () => {
    const fn = jest.fn();
    const { rerender, unmount } = renderer(fn);

    rerender(fn);
    unmount();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call any fn if fn change', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    renderer(fn1).rerender(fn2);

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });

  it('should call fn1 once on unmount after fn change', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const { rerender, unmount } = renderer(fn1);

    rerender(fn2);
    unmount();

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();
  });
});
