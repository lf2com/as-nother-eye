type ShareData = Required<Parameters<Navigator['canShare']>>[0];

export const canShare = (data: ShareData) => navigator.canShare(data);

const shareData = async (data: ShareData) => {
  console.warn(100, data);
  if (!canShare(data)) {
    console.warn(110);
    throw Error('Cannot share data');
  }

  console.warn(120);
  await navigator.share(data);
};

export default shareData;
