import wait from '../wait';

const flushPromise = () => new Promise((resolve) => {
  jest.requireActual('timers').setImmediate(resolve);
});

describe('wait', () => {
  it('should return a promise', () => {
    expect(wait(0)).toBeInstanceOf(Promise);
  });

  it('should wait for 1000 ms', async () => {
    const after = jest.fn();

    jest.useFakeTimers();
    wait(1000).then(after);
    jest.advanceTimersByTime(990);
    await flushPromise();
    expect(after).not.toBeCalled();
    jest.advanceTimersByTime(10);
    await flushPromise();
    expect(after).toBeCalledTimes(1);
  });
});
