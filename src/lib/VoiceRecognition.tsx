import type { IUseChat } from "@dtelecom/components-react";
import { useLocalParticipant } from "@dtelecom/components-react";
import * as React from "react";
import { useCallback, useEffect } from "react";
import type { ReceivedChatTranscription } from "@dtelecom/components-core";
import { DataTopic } from "@dtelecom/components-core";
import axios from "axios";
import { languageOptions } from "@/lib/languageOptions";

interface VoiceRecognitionProps {
  language?: string;
  token: string;
  chatContext: IUseChat;
}

export const VoiceRecognition = ({
  language,
  token,
  chatContext: { sendTranscription, transcriptions, addLocalMessage },
}: VoiceRecognitionProps) => {
  const { microphoneTrack, isMicrophoneEnabled } = useLocalParticipant();
  const [isRecording, setIsRecording] = React.useState(false);
  const websocket = React.useRef<WebSocket | null>(null);
  const recorder = React.useRef<MediaRecorder | null>(null);
  const currentIndex = React.useRef<number>(0);

  const addToChatOrTranslate = useCallback(() => {
    for (let i = currentIndex.current; i < transcriptions.length; i++) {
      currentIndex.current = currentIndex.current + 1;

      const item = transcriptions[i];
      if (!item) return;

      if (language && item.language !== language) {
        void translate(item.transcription, item.language, language)
          .then((translated) => {
            if (translated) {
              sendItem(
                {
                  ...item,
                  transcription: translated,
                },
                true
              );
            }
          })
          .catch((e) => {
            console.error("error translating", e);
            sendItem(item);
          });
      } else {
        sendItem(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptions.length]);

  const translate = useCallback(
    async (text: string, source: string, target: string) => {
      const response = await axios.post<{ translated: string }>(
        "https://voice.dmeet.org/translate",
        {
          text,
          source,
          target,
        }
      );

      return response.data.translated;
    },
    []
  );

  const sendItem = (item: ReceivedChatTranscription, translated?: boolean) => {
    if (addLocalMessage && item?.from) {
      addLocalMessage(
        item.transcription,
        item.from,
        DataTopic.CHAT,
        item.timestamp,
        "transcription",
        item.language,
        translated ? language : undefined
      );
    }
  };
  useEffect(() => {
    addToChatOrTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptions.length]);

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
      if (language === undefined) return;
      const wsLang =
        languageOptions.find((l) => l.code === language)
          ?.voiceRecognitionOverride || language;
      setIsRecording(true);
      recorder.current = getRecorder(mediaStream);
      websocket.current = new WebSocket(
        `wss://voice.dmeet.org/ws?lang=${wsLang}&token=${token}`
      );

      await createRecorder();
      websocket.current.onmessage = (event) => {
        if (sendTranscription) {
          try {
            const data = JSON.parse(event.data as string) as {
              translated: string;
              transcription: string;
              language: string;
            };
            void sendTranscription(data.transcription, language);
          } catch (e) {}
        }
      };
    },
    [getRecorder, language, createRecorder, sendTranscription, token]
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
