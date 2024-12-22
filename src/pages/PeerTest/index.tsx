import type { DataConnection, MediaConnection } from 'peerjs';
import type { ComponentProps, FC } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Button from '@/components/Button';
import { DoubleBtnModal, SingleBtnModal } from '@/components/common/Modal';
import InputValueModal from '@/components/common/Modal/InputValueModal';
import VideoWithSrcObject from '@/components/common/VideoWithSrcObject';
import { useOverlayContext } from '@/contexts/OverlayProvider/OverlayProvider';
import useCamera from '@/hooks/useCamera';
import { useUnmount } from '@/hooks/useMount';
import usePeer from '@/hooks/usePeer';
import usePeerDataConnection from '@/hooks/usePeerDataConnection';
import usePeerMediaConnection from '@/hooks/usePeerMediaConnection';
import randomStr from '@/utils/random';

enum OverlayId {
  getValue = 'getValue',
  answerCall = 'answerCall',
  callRejected = 'callRejected',
  callClosed = 'callClosed',
}

const ValueButton: FC<
  ComponentProps<typeof Button> & {
    onValue: (val: string) => void;
  }
> = ({ className, onValue, ...restProps }) => {
  const { open, close } = useOverlayContext();

  useUnmount(() => {
    close(OverlayId.getValue);
  });

  return (
    <Button
      onClick={() => {
        open(
          <InputValueModal
            onCancel={() => close(OverlayId.getValue)}
            onOk={value => {
              close(OverlayId.getValue);

              if (value) {
                onValue(value);
              }
            }}
          />,
          {
            closeOnBackdrop: false,
            id: OverlayId.getValue,
          }
        );
      }}
      {...restProps}
    />
  );
};

const PeerTest: FC = () => {
  const { open, close } = useOverlayContext();
  const { id = randomStr() } = useParams();
  const { stream: cameraStream } = useCamera();
  const [dataConn, setDataConn] = useState<DataConnection | null>(null);
  const [mediaConn, setMediaConn] = useState<MediaConnection | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);

  const peer = usePeer(id, {
    onConnection: setDataConn,
    onCall: conn => {
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
            setMediaConn(conn);
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
  });

  useUnmount(() => {
    close(OverlayId.answerCall);
  });

  usePeerDataConnection(dataConn, {
    onOpen: () => {
      dataConn?.send(`I'm ${id}`);
    },
    onData: data => setMessages(prev => prev.concat(`${data}`)),
    onClose: () => {
      setDataConn(null);
    },
  });

  const { send } = usePeerMediaConnection(mediaConn, {
    onClose: () => {
      setMediaConn(null);
      open(
        <SingleBtnModal
          btnContent="OK"
          onClick={() => {
            close(OverlayId.callClosed);
          }}
        >
          Call was closed
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
    onMessage: data => setMessages(prev => prev.concat(`${data}`)),
  });

  return (
    <div className="relative w-full h-full overflow-auto">
      <VideoWithSrcObject
        srcObject={cameraStream}
        className="absolute -z-10 w-full h-full"
        autoPlay
      />

      {peerStream && (
        <VideoWithSrcObject
          srcObject={peerStream}
          className="absolute -z-[5] bottom-0 left-0 w-[30%] h-auto"
          autoPlay
        />
      )}

      <div className="absolute z-10 right-0 bottom-0 p-1 text-right text-shadow-white pointer-events-none">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>

      <div className="flex flex-col p-1 gap-1">
        <div>id: {id}</div>

        <div className="flex gap-1">
          peer:
          <ValueButton
            className="px-1 border border-black"
            disabled={!peer}
            onValue={id => {
              setDataConn(peer?.connect(id) ?? null);
            }}
          >
            Connect
          </ValueButton>
          <ValueButton
            disabled={!peer || !cameraStream}
            onValue={async id => {
              if (!cameraStream || !peer) {
                return;
              }

              try {
                const { mediaConnection, stream } = await peer.callPromise(
                  id,
                  cameraStream
                );

                setMediaConn(mediaConnection);
                setPeerStream(stream);
              } catch {
                setMediaConn(null);
                setPeerStream(null);
                open(
                  <SingleBtnModal
                    btnContent="OK"
                    onClick={() => {
                      close(OverlayId.callRejected);
                    }}
                  >
                    Call was rejected
                  </SingleBtnModal>,
                  {
                    id: OverlayId.callRejected,
                  }
                );
              }
            }}
          >
            Call
          </ValueButton>
          <Button
            disabled={!peer}
            onClick={() => {
              Object.values(peer?.connections ?? {}).forEach(
                (conns: (DataConnection | MediaConnection)[]) => {
                  conns.forEach(conn => conn.close());
                }
              );
              peer?.disconnect();
            }}
          >
            Disconnect
          </Button>
        </div>

        <div className="flex gap-1">
          dataConn:
          <ValueButton
            disabled={!dataConn}
            onValue={msg => {
              dataConn?.send(msg);
            }}
          >
            Send
          </ValueButton>
          <Button
            disabled={!dataConn}
            onClick={() => {
              dataConn?.close();
            }}
          >
            Close
          </Button>
        </div>

        <div className="flex gap-1">
          mediaConn:
          <ValueButton
            disabled={!send}
            onValue={msg => {
              mediaConn?.dataChannel.send(msg);
            }}
          >
            Send
          </ValueButton>
          <Button
            disabled={!mediaConn}
            onClick={() => {
              mediaConn?.close();
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerTest;
