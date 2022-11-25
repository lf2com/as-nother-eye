import mergeObject from './mergeObject';

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
) => navigator.mediaDevices.getUserMedia(
  mergeObject(defaultStreamConstraints, constraints),
);

export const stopStream = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => track.stop());
};

export const switchCamera = async (stream: MediaStream) => {
  const constraints = stream.getVideoTracks()[0]?.getConstraints();

  if (!constraints) {
    return;
  }

  const { deviceId } = constraints;
  const cameras = await getCameras();
  const currentCameraIndex = cameras.findIndex((camera) => deviceId === camera.deviceId);
  const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
  const nextCamera = cameras[nextCameraIndex];
  const camera = await startStream({
    video: {
      deviceId: nextCamera.deviceId,
    },
  });

  stopStream(stream);
  stream.getTracks().forEach((track) => {
    stream.removeTrack(track);
  });
  camera.getTracks().forEach((track) => {
    stream.addTrack(track);
  });
};
