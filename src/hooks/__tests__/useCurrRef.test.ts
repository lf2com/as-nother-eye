import { renderHook } from '@testing-library/react';

import useCurrRef from '../useCurrRef';

describe('useCurrRef', () => {
  const renderer = (...[val]: Parameters<typeof useCurrRef>) =>
    renderHook((...[newVal = val]: Parameters<typeof useCurrRef>) =>
      useCurrRef(newVal)
    );

  it('should return ref with value', () => {
    const { result } = renderer('test-val');

    console.log(100, result);
    expect(result.current).toEqual({
      current: 'test-val',
    });
  });

  it('should return new value without changing ref', () => {
    const { result, rerender } = renderer('test-val');
    const prev = result.current;

    rerender('test-val2');

    expect(result.current).toBe(prev);
    expect(result.current.current).toBe('test-val2');
    expect(prev.current).toBe('test-val2');
  });
});
