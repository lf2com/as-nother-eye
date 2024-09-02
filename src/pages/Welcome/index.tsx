import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';

const Welcome = () => {
  const navigate = useNavigate();

  const handleAsPhotoer = useCallback(() => {
    navigate('/photoer');
  }, [navigate]);

  const handleAsCamera = useCallback(() => {
    navigate('/camera');
  }, [navigate]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-[1em]">
      <Button onClick={handleAsPhotoer}>As Photoer</Button>
      <Button onClick={handleAsCamera}>As Camera</Button>
    </div>
  );
};

export default Welcome;
