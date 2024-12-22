import type { FC } from 'react';
import { useCallback } from 'react';

import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import shareData from '@/utils/shareData';

import Photo from './Photo';
import PhotoList from './PhotoList';

const OVERLAY_ID = 'photo-list';

interface PhotosProps {
  urls: string[];
}

const Photos: FC<PhotosProps> = ({ urls }) => {
  const { open, close } = useOverlayContext();

  const handleClick = useCallback(() => {
    open(
      <PhotoList
        urls={urls}
        onOk={async selectedUrls => {
          const date = new Date();
          const dateStr = [
            date.getFullYear(),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            date.getDate().toString().padStart(2, '0'),
          ].join('');

          const files = await Promise.all(
            selectedUrls.map(async (url, index) => {
              const result = await fetch(url);
              const blob = await result.blob();
              const { type } = blob;
              const name = `photo_${dateStr}_${index + 1}`;

              return new File([blob], name, { type });
            })
          );

          await shareData({
            title: 'As nother eye',
            text: `I took ${selectedUrls.length} photos with this app`,
            files,
            url: location.origin,
          });
        }}
        onClose={() => close(OVERLAY_ID)}
      />,
      {
        id: OVERLAY_ID,
      }
    );
  }, [close, open, urls]);

  return (
    <div className="w-full h-full" onClick={handleClick}>
      {urls.map(url => (
        <Photo key={url} url={url} />
      ))}
    </div>
  );
};

export default Photos;
