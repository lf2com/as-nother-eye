import mergeObject from '@/utils/mergeObject';

type MediaStreamConstraints = Parameters<MediaDevices['getUserMedia']>[0];

const defaultStreamConstraints: MediaStreamConstraints = {
  video: {
    focusMode: 'continuous',
  },
};

export const getDevices = async () => navigator.mediaDevices.enumerateDevices();

export const getCameras = async () => (await getDevices())
  .filter(({ kind }) => kind === 'videoinput');

export const getMicrophones = async () => (await getDevices())
  .filter(({ kind }) => kind === 'audioinput');

export const getSpeakers = async () => (await getDevices())
  .filter(({ kind }) => kind === 'audiooutput');

export const startStream = async (
  constraints: MediaStreamConstraints = defaultStreamConstraints,
) => {
  const cameras = await getCameras();
  const realCameras = cameras.filter((info) => !/\bvirtual\b/i.test(info.label));
  const realCamera = realCameras[0];
  const realCameraConstraints: MediaStreamConstraints = {
    video: {
      deviceId: realCamera?.deviceId,
    },
  };

  return navigator.mediaDevices.getUserMedia(mergeObject(realCameraConstraints, constraints));
};

export const stopStream = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => track.stop());
};

export const getNextCamera = async (prevStream?: MediaStream): Promise<MediaDeviceInfo | null> => {
  const constraints = prevStream?.getVideoTracks()[0]?.getConstraints();

  if (!constraints) {
    return null;
  }

  const cameras = await getCameras();
  const {
    deviceId = cameras[0]?.deviceId,
  } = constraints;
  const currentCameraIndex = cameras.findIndex((camera) => deviceId === camera.deviceId);
  const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;

  if (currentCameraIndex === nextCameraIndex) {
    return null;
  }

  return cameras[nextCameraIndex];
};

export const minifyCameraStream = (stream: MediaStream) => {
  const minStream = stream.clone();

  minStream.getTracks().forEach((track) => {
    const { width, height } = track.getCapabilities();

    track.applyConstraints({
      width: {
        max: Math.round(Number(width?.max ?? 0) / 3),
      },
      height: {
        max: Math.round(Number(height?.max ?? 0) / 3),
      },
      frameRate: 15,
    });
  });

  return minStream;
};
