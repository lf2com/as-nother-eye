const wait = async (msec: number) =>
  new Promise(resolve => {
    setTimeout(resolve, msec);
  });

export default wait;
