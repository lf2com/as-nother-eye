import type { MediaConnection } from 'peerjs';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Button from '@/components/Button';
import Clickable from '@/components/Clickable';
import {
  DoubleBtnModal,
  InputValueModal,
  NoBtnModal,
  SingleBtnModal,
} from '@/components/common/Modal';
import VideoWithSrcObject from '@/components/common/VideoWithSrcObject';
import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import useCamera from '@/hooks/useCamera';
import useCurrRef from '@/hooks/useCurrRef';
import usePeer from '@/hooks/usePeer';
import usePeerMediaConnection from '@/hooks/usePeerMediaConnection';
import useStream from '@/hooks/useStream';
import randomStr from '@/utils/random';
import shareData from '@/utils/shareData';

import { CatcherMessage, ViewerMessage } from '../constants';
import Photos from './Photos';

enum OverlayId {
  busy = 'busy',
  noPeer = 'noPeer',
  peerId = 'peerId',
  waitPeer = 'waitPeer',
  peerReject = 'peerReject',
  peerLeave = 'peerLeave',
  error = 'error',
  answerCall = 'answerCall',
  callClosed = 'callClosed',
}

const Catcher: FC = () => {
  const { open, close } = useOverlayContext();
  const { id: paramId } = useParams();
  const [id] = useState(() => paramId ?? randomStr());
  const { stream, switchCamera } = useCamera();
  const [mediaConn, setMediaConn] = useState<MediaConnection | null>(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const [flipX, setFlipX] = useState(true);
  const [flipY, setFlipY] = useState(false);
  const { canvas, stream: cameraStream } = useStream(stream, {
    flipX,
    flipY,
  });

  const [isWaitingCall, setIsWaitingCall] = useState(false);
  const peer = usePeer(id, {
    onCall: conn => {
      if (!isWaitingCall) {
        conn.answer(undefined);
        setMediaConn(null);
        return;
      }

      open(
        <DoubleBtnModal
          btnAContent="No"
          btnBContent="Yes"
          onClickA={() => {
            close(OverlayId.answerCall);
            conn.answer(undefined);
            setMediaConn(null);
          }}
          onClickB={() => {
            close(OverlayId.answerCall);
            conn.answer(cameraStream ?? undefined);
            setMediaConn(cameraStream ? conn : null);
          }}
        >
          Accept call from [{conn.peer}]?
        </DoubleBtnModal>,
        {
          closeOnBackdrop: false,
          id: OverlayId.answerCall,
        }
      );
    },
    onError: error => {
      open(
        <SingleBtnModal
          btnContent="OK"
          onClick={() => {
            close(OverlayId.error);
          }}
        >
          {`Connection failed: ${error.message}`}
        </SingleBtnModal>,
        {
          id: OverlayId.error,
        }
      );
    },
  });

  const [isPhotoing, setIsPhotoing] = useState(false);
  const isPhotoingRef = useCurrRef(isPhotoing);

  const { send, state: mediaState } = usePeerMediaConnection(mediaConn, {
    onClose: () => {
      open(
        <SingleBtnModal
          btnContent="OK"
          onClick={() => {
            close(OverlayId.callClosed);
            setMediaConn(null);
          }}
        >
          Connection closed
        </SingleBtnModal>,
        {
          id: OverlayId.callClosed,
        }
      );
    },
    onStream: stream => {
      setPeerStream(stream);
    },
    onWillCloseOnRemote: () => {},
    onCallRejected: () => {},
    onMessage: data => {
      const message = `${data}` as CatcherMessage;

      switch (message) {
        case CatcherMessage.catch:
          takePhoto();
          break;

        case CatcherMessage.nextCamera:
          switchCamera();
          break;

        case CatcherMessage.flipX:
          setFlipX(prev => !prev);
          break;

        case CatcherMessage.flipY:
          setFlipY(prev => !prev);
          break;

        default:
          break;
      }
    },
    onError: error => {
      open(
        <SingleBtnModal
          btnContent="OK"
          onClick={() => {
            close(OverlayId.error);
          }}
        >
          {`Peer stream connection failed: ${error.message}`}
        </SingleBtnModal>,
        {
          id: OverlayId.error,
        }
      );
    },
  });

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const takePhoto = useCallback(async () => {
    if (!canvas || isPhotoingRef.current) {
      return;
    }

    send?.(ViewerMessage.catchStart);
    setIsPhotoing(true);

    try {
      const blob = await new Promise<Blob | null>(resolve => {
        canvas?.toBlob(resolve, 'image/png', 1);
      });

      if (!blob) {
        throw Error('Could not create image blob');
      }

      setPhotoUrls(prev => prev.concat(URL.createObjectURL(blob)));
    } catch (error) {
      open(
        <SingleBtnModal
          btnContent="OK"
          onClick={() => {
            close(OverlayId.error);
          }}
        >
          {`Failed to take photo: ${(error as Error)?.message}`}
        </SingleBtnModal>,
        {
          id: OverlayId.error,
        }
      );
    }

    setIsPhotoing(false);
    send?.(ViewerMessage.catchEnd);
  }, [canvas, close, isPhotoingRef, open, send]);

  useEffect(() => {
    if (!peer || !cameraStream) {
      open(<NoBtnModal>Initializing</NoBtnModal>, {
        id: OverlayId.busy,
        closeOnBackdrop: false,
      });

      return () => {
        close(OverlayId.busy);
      };
    }

    if (!mediaConn) {
      open(
        <DoubleBtnModal
          btnAContent="Share camera"
          btnBContent="Connect peer"
          onClickA={async () => {
            const url = new URL('/viewer', location.origin).toString();

            setIsWaitingCall(true);
            open(
              <SingleBtnModal
                btnContent="Cancel"
                onClick={() => {
                  close(OverlayId.waitPeer);
                  setIsWaitingCall(false);
                }}
              >
                Waiting for connection
              </SingleBtnModal>,
              {
                id: OverlayId.waitPeer,
                closeOnBackdrop: false,
              }
            );

            try {
              await shareData({ url });
            } catch {
              // do nothing
            }
          }}
          onClickB={() => {
            open(
              <InputValueModal
                onCancel={() => {
                  close(OverlayId.peerId);
                }}
                onOk={async peerId => {
                  try {
                    if (!peerId) {
                      throw Error('No peer id');
                    }

                    open(<NoBtnModal>Connecting</NoBtnModal>, {
                      id: OverlayId.busy,
                      closeOnBackdrop: false,
                    });

                    const { mediaConnection, stream } = await peer.callPromise(
                      peerId,
                      cameraStream
                    );

                    setMediaConn(mediaConnection);
                    setPeerStream(stream);
                  } catch (error) {
                    setMediaConn(null);
                    setPeerStream(null);
                    open(
                      <SingleBtnModal
                        btnContent="OK"
                        onClick={() => {
                          close(OverlayId.peerReject);
                        }}
                      >
                        {(error as Error)?.message ||
                          'Peer rejected connection'}
                      </SingleBtnModal>,
                      {
                        id: OverlayId.peerReject,
                      }
                    );
                  }

                  close(OverlayId.busy);
                }}
              >
                Enter peer ID
              </InputValueModal>,
              {
                id: OverlayId.peerId,
                closeOnBackdrop: false,
              }
            );
          }}
        >
          Yet to connect to peer
        </DoubleBtnModal>,
        {
          id: OverlayId.noPeer,
          closeOnBackdrop: false,
        }
      );

      return () => {
        close(OverlayId.peerId);
        close(OverlayId.noPeer);
        close(OverlayId.waitPeer);
      };
    }
  }, [cameraStream, close, open, peer, mediaConn, send]);

  useEffect(() => {
    if (!send || mediaState !== 'connected') {
      return;
    }

    if (cameraStream) {
      send(ViewerMessage.nextCameraEnd);
    } else {
      send(ViewerMessage.nextCameraStart);
    }
  }, [cameraStream, mediaState, send]);

  return (
    <div className="relative w-full h-full bg-black">
      {cameraStream && (
        <VideoWithSrcObject
          srcObject={cameraStream}
          className="absolute w-full h-full"
          autoPlay
          onClick={() => switchCamera()}
        />
      )}

      {peerStream && (
        <VideoWithSrcObject
          srcObject={peerStream}
          className="absolute z-10 bottom-0 left-0 w-[30%] h-auto"
          autoPlay
        />
      )}

      <div className="absolute right-0 bottom-0 m-2 w-[25%] h-[25%] pointer-events-none">
        <Photos urls={photoUrls} />
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
        <div className="p-2 flex gap-2 bg-white/50 [&>*]:pointer-events-auto">
          <Button onClick={() => setFlipX(prev => !prev)}>Flip X</Button>
          <Button onClick={() => setFlipY(prev => !prev)}>Flip Y</Button>
        </div>
        <div className="py-[10vmin] flex justify-center">
          <Clickable
            isActive={isPhotoing}
            disabled={!cameraStream || isPhotoing}
            onClick={takePhoto}
            className="pointer-events-auto"
          >
            <div className="w-[25vmin] aspect-square outline outline-1 outline-black border-2 border-white shadow-[inset_0_0_0_2vmin_#000] bg-white rounded-50%" />
          </Clickable>
        </div>
      </div>
    </div>
  );
};

export default Catcher;
