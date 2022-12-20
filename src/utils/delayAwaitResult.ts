import wait from '@/utils/wait';

const delayAwaitResult = async <P>(
  promise: P,
  msec: number = 0,
): Promise<Awaited<P>> => {
  const [result] = await Promise.all([promise, wait(msec)]);

  return result;
};

export default delayAwaitResult;
