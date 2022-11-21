import wait from './wait';

const delayAwaitResult = async <P>(
  promise: P,
  msec: number = 0,
): Promise<Awaited<P>> => {
  const results = await Promise.all([promise, wait(msec)])
    .catch((e) => {
      console.warn(310, e);
    });

  console.log(300, results);
  return results[0];
};

export default delayAwaitResult;
