import type { IUseChat } from "@dtelecom/components-react";
import { useLocalParticipant } from "@dtelecom/components-react";
import * as React from "react";
import { useCallback, useEffect } from "react";

interface VoiceRecognitionProps {
  language: string;
  token: string;
  sendMessage: IUseChat["send"];
}

export const VoiceRecognition = ({
  language,
  token,
  sendMessage,
}: VoiceRecognitionProps) => {
  const { microphoneTrack, isMicrophoneEnabled } = useLocalParticipant();
  const [isRecording, setIsRecording] = React.useState(false);
  const websocket = React.useRef<WebSocket | null>(null);
  const recorder = React.useRef<MediaRecorder | null>(null);

  const getRecorder = useCallback((mediaStream: MediaStream) => {
    try {
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      return new MediaRecorder(mediaStream, { mimeType: mimeType });
    } catch (error) {
      console.error("error creating recorder:", error);
      throw error;
    }
  }, []);

  const createRecorder = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (!recorder.current) return;
      recorder.current.onstart = () => {
        resolve();
      };
      recorder.current.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          websocket.current &&
          websocket.current.readyState === WebSocket.OPEN
        ) {
          websocket.current.send(event.data);
        }
      };
      recorder.current.start(1000);
    });
  }, []);

  const startRecording = useCallback(
    async (mediaStream: MediaStream) => {
      setIsRecording(true);
      recorder.current = getRecorder(mediaStream);
      websocket.current = new WebSocket(
        `wss://voice.dmeet.org/ws?lang=${language}&token=${token}`
      );

      await createRecorder();
      websocket.current.onmessage = (event) => {
        if (sendMessage) {
          try {
            const data = JSON.parse(event.data as string) as {
              translated: string;
            };
            void sendMessage(data.translated);
          } catch (e) {}
        }
      };
    },
    [getRecorder, language, createRecorder, sendMessage, token]
  );

  const stopRecording = useCallback(() => {
    if (recorder.current && isRecording) {
      recorder.current.stop();
      recorder.current = null;

      setIsRecording(false);
    }

    if (websocket.current) {
      websocket.current.close();
      websocket.current;
    }
  }, [isRecording]);

  useEffect(() => {
    const mediaStream = microphoneTrack?.track?.mediaStream;

    if (isMicrophoneEnabled && mediaStream) {
      void startRecording(mediaStream);
    } else if (!isMicrophoneEnabled) {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicrophoneEnabled, microphoneTrack]);

  return <></>;
};
