import {
  getCameras, getDevices, getMicrophones, getNextCamera,
  getSpeakers, minifyCameraStream,
  startStream, stopStream,
} from '../userMedia';

type MediaDeviceInfo = (Awaited<
  ReturnType<typeof navigator.mediaDevices.enumerateDevices>
>)[0];

type MediaStreamConstraints = Parameters<typeof navigator.mediaDevices.getUserMedia>[0];

const mockEnumerateDevices = (results: Partial<MediaDeviceInfo>[]) => {
  jest
    .spyOn(window, 'navigator', 'get')
    .mockImplementation(() => ({
      mediaDevices: {
        enumerateDevices: async () => results,
      } as unknown as MediaDevices,
    } as Navigator));
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('Device related', () => {
  describe('getDevices', () => {
    it('should return array', () => {
      mockEnumerateDevices([]);

      expect(getDevices()).resolves.toBeInstanceOf(Array);
    });

    it('should call navigator.mediaDevices.enumerateDevices', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);

      expect(getDevices()).resolves.toEqual([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);
    });
  });

  describe('getCameras', () => {
    it('should return array', () => {
      mockEnumerateDevices([]);

      expect(getCameras()).resolves.toBeInstanceOf(Array);
    });

    it('should return devices with kind of videoinput', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);

      expect(getCameras()).resolves.toEqual([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
      ]);
    });
  });

  describe('getMicrophones', () => {
    it('should return array', () => {
      mockEnumerateDevices([]);

      expect(getMicrophones()).resolves.toBeInstanceOf(Array);
    });

    it('should return devices with kind of audioinput', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);

      expect(getMicrophones()).resolves.toEqual([
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
      ]);
    });
  });

  describe('getSpeakers', () => {
    it('should return array', () => {
      mockEnumerateDevices([]);

      expect(getSpeakers()).resolves.toBeInstanceOf(Array);
    });

    it('should return devices with kind of audiooutput', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-videoinput-device',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-audioinput-device',
          kind: 'audioinput',
        },
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);

      expect(getSpeakers()).resolves.toEqual([
        {
          deviceId: 'fake-audiooutput-device',
          kind: 'audiooutput',
        },
      ]);
    });
  });
});

describe('Stream related', () => {
  const mockUserMedia = <T>(
    implementation: (constraints: MediaStreamConstraints) => T,
    enumeratedDevices: Partial<MediaDeviceInfo>[] = [],
  ) => {
    jest
      .spyOn(window, 'navigator', 'get')
      .mockImplementation(() => ({
        mediaDevices: {
          enumerateDevices: async () => enumeratedDevices,
          getUserMedia: implementation,
        } as unknown as MediaDevices,
      } as Navigator));
  };

  const mockMediaStreamTracks = (tracks: Partial<MediaStreamTrack>[]): MediaStream => ({
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
  } as unknown as MediaStream);

  describe('startStream', () => {
    it('should ask media device with specific resolution', async () => {
      const mockedGetUserMedia = jest.fn();

      mockUserMedia(mockedGetUserMedia);

      await startStream({
        video: {
          deviceId: 'fake-video-id',
        },
      });

      expect(mockedGetUserMedia).toBeCalledWith({
        video: expect.objectContaining({
          deviceId: 'fake-video-id',
        }),
      });
    });

    it('should ignore virtual cameras on auto creation', async () => {
      const mockedGetUserMedia = jest.fn();

      mockUserMedia(mockedGetUserMedia, [
        {
          deviceId: 'fake-virtual-device',
          label: 'fake-virtual-device-label',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-real-device',
          label: 'fake-real-device-label',
          kind: 'videoinput',
        },
      ]);

      await startStream();

      expect(mockedGetUserMedia).toBeCalledWith({
        video: expect.objectContaining({
          deviceId: 'fake-real-device',
        }),
      });
    });
  });

  describe('stopStream', () => {
    it('should call track.stop on stopping stream', () => {
      const mockedTrack = {
        stop: jest.fn(),
      };
      const mockedStream = mockMediaStreamTracks([mockedTrack, mockedTrack]);

      stopStream(mockedStream);
      expect(mockedTrack.stop).toBeCalledTimes(2);
    });
  });

  describe('getNextCamera', () => {
    it('should return next camera if has other cameras', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-video-1',
          label: 'fake-video-1',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-video-2',
          label: 'fake-video-2',
          kind: 'videoinput',
        },
        {
          deviceId: 'fake-video-3',
          label: 'fake-video-3',
          kind: 'videoinput',
        },
      ]);

      const mockedStream = mockMediaStreamTracks([
        {
          getConstraints: () => ({
            deviceId: 'fake-video-1',
          }),
        },
      ]);

      expect(getNextCamera(mockedStream)).resolves.toEqual(
        expect.objectContaining({
          deviceId: 'fake-video-2',
        }),
      );
    });

    it('should return null if no video track', () => {
      const mockedStream = mockMediaStreamTracks([]);

      expect(getNextCamera(mockedStream)).resolves.toBe(null);
    });

    it('should return null if only has the same camera', () => {
      mockEnumerateDevices([
        {
          deviceId: 'fake-video-1',
          label: 'fake-video-1',
          kind: 'videoinput',
        },
      ]);

      const mockedStream = mockMediaStreamTracks([
        {
          getConstraints: () => ({
            deviceId: 'fake-video-1',
          }),
        } as unknown as MediaStreamTrack,
      ]);

      expect(getNextCamera(mockedStream)).resolves.toBe(null);
    });

    it('should return null if no camera', () => {
      mockEnumerateDevices([]);

      const mockedStream = mockMediaStreamTracks([
        {
          getConstraints: () => ({
            deviceId: 'fake-video-1',
          }),
        } as unknown as MediaStreamTrack,
      ]);

      expect(getNextCamera(mockedStream)).resolves.toBe(null);
    });
  });

  describe('minifyCameraStream', () => {
    const mockMediaStreamClone = (clone: () => Partial<MediaStream>): MediaStream => ({
      clone,
    } as unknown as MediaStream);

    it('should call stream.clone', () => {
      const mockedClone = jest.fn(() => ({
        getTracks: () => [],
        getVideoTracks: () => [],
      } as unknown as MediaStream));

      const mockedStream = mockMediaStreamClone(mockedClone);

      minifyCameraStream(mockedStream);
      expect(mockedClone).toBeCalled();
    });

    it('should call track.applyConstraints', () => {
      const mockedTrack = {
        applyConstraints: jest.fn(),
        getCapabilities: () => ({
          width: {
            max: 100,
            min: 10,
          },
          height: {
            max: 200,
            min: 20,
          },
        }),
      } as unknown as MediaStreamTrack;

      const mockedClone = () => ({
        getTracks: () => [mockedTrack],
        getVideoTracks: () => [mockedTrack],
      } as unknown as MediaStream);

      const mockedStream = mockMediaStreamClone(mockedClone);

      minifyCameraStream(mockedStream);
      expect(mockedTrack.applyConstraints).toBeCalledWith(expect.objectContaining({
        width: expect.anything(),
        height: expect.anything(),
      }));
    });
  });
});
