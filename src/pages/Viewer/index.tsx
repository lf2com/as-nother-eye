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
import usePeer from '@/hooks/usePeer';
import usePeerMediaConnection from '@/hooks/usePeerMediaConnection';
import randomStr from '@/utils/random';
import shareData from '@/utils/shareData';

import { CatcherMessage, ViewerMessage } from '../constants';

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

const Viewer: FC = () => {
  const { open, close } = useOverlayContext();
  const { id: paramId } = useParams();
  const [id] = useState(() => paramId ?? randomStr());
  const { stream: cameraStream, switchCamera } = useCamera();
  const [mediaConn, setMediaConn] = useState<MediaConnection | null>(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);

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

  const [waitCamera, setWaitCamera] = useState(false);
  const [waitPhoto, setWaitPhoto] = useState(false);

  const { send } = usePeerMediaConnection(mediaConn, {
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
      const message = `${data}` as ViewerMessage;

      switch (message) {
        case ViewerMessage.catchStart:
          setWaitPhoto(true);
          break;

        case ViewerMessage.catchEnd:
          setWaitPhoto(false);
          break;

        case ViewerMessage.nextCameraStart:
          setWaitCamera(true);
          break;

        case ViewerMessage.nextCameraEnd:
          setWaitCamera(false);
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

  const takePhoto = useCallback(async () => {
    if (!send || waitPhoto || waitCamera) {
      return;
    }

    send?.(CatcherMessage.catch);
    setWaitPhoto(true);
  }, [send, waitCamera, waitPhoto]);

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
            const url = new URL('/catcher', location.origin).toString();

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
  }, [cameraStream, close, open, peer, mediaConn]);

  return (
    <div className="relative w-full h-full bg-black">
      {peerStream && (
        <VideoWithSrcObject
          srcObject={peerStream}
          className="absolute w-full h-full"
          autoPlay
          onClick={() => {
            send?.(CatcherMessage.nextCamera);
          }}
        />
      )}

      {cameraStream && (
        <VideoWithSrcObject
          srcObject={cameraStream}
          className="absolute z-10 bottom-0 left-0 max-w-[25%] max-h-[25%]"
          autoPlay
          onClick={() => switchCamera()}
        />
      )}

      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
        <div className="p-2 flex gap-2 [&>*]:bg-white/75">
          <Button onClick={() => send?.(CatcherMessage.flipX)}>Flip X</Button>
          <Button onClick={() => send?.(CatcherMessage.flipY)}>Flip Y</Button>
        </div>
        <div className="py-[1rem] flex justify-center">
          <Clickable
            isActive={waitPhoto}
            disabled={waitCamera || waitPhoto}
            onClick={takePhoto}
            className="pointer-events-auto"
          >
            <div className="w-[3.25rem] aspect-square outline outline-1 outline-black border-2 border-white shadow-[inset_0_0_0_.35rem_#000] bg-white rounded-50%" />
          </Clickable>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
