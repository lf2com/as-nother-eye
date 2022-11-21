type ShareData = Required<Parameters<Navigator['canShare']>>[0];

export const canShare = (data: ShareData) => navigator.canShare(data);

const shareData = async (data: ShareData) => {
  if (!canShare(data)) {
    throw Error('Cannot share data');
  }

  await navigator.share(data);
};

export default shareData;
