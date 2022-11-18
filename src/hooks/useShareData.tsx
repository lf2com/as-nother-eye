import { useCallback, useMemo } from 'react';

type ShareData = Required<Parameters<Navigator['canShare']>>[0];

type useShareDataFunc = (data: ShareData) => {
  canShare: boolean;
  share: () => Promise<void>;
}

const useShareData: useShareDataFunc = (shareData) => {
  const canShare = useMemo(() => navigator.canShare(shareData), [shareData]);
  const share = useCallback(() => navigator.share(shareData), [shareData]);

  return { canShare, share };
};

export default useShareData;
