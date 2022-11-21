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
