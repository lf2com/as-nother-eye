const getUserMedia = async (...args: Parameters<MediaDevices['getUserMedia']>) => (
  navigator.mediaDevices.getUserMedia(...args)
);

export default getUserMedia;
