type ShareData = Required<Parameters<Navigator['canShare']>>[0];

const shareData = async (data: ShareData) => {
  if (!navigator.canShare(data)) {
    throw Error('Unable to share');
  }

  return navigator.share(data);
};

export default shareData;
