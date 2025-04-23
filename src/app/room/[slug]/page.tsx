'use client';

import type { LocalUserChoices } from "@dtelecom/components-react";
import {
  formatChatMessageLinks,
  LiveKitRoom,
  useChat, useLocalParticipant,
  useRoomContext,
  VideoConference
} from "@dtelecom/components-react";
import React, { useEffect, useMemo } from "react";
import type { NextPage } from "next";
import type { RoomOptions } from "@dtelecom/livekit-client";
import { LogLevel, RoomEvent, VideoPresets } from "@dtelecom/livekit-client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DebugMode } from "@/lib/Debug";
import { Footer } from "@/components/ui/Footer/Footer";
import axios from "axios";
import { RoomNavBar } from "@/components/ui/RoomNavBar/RoomNavBar";
import type { GridLayoutDefinition } from "@dtelecom/components-core";
import { isMobileBrowser } from "@dtelecom/components-core";
import { VoiceRecognition } from "@/lib/VoiceRecognition";
import { debounce } from "ts-debounce";
import { languageOptions } from "@/lib/languageOptions";

const useRoomParams = () => {
  const params = useSearchParams();
  const router = useRouter();
  const p = useParams();
  const slug = p.slug as string || "";

  const token = params.get("token") || "";
  const wsUrl = params.get("wsUrl") || "";
  const roomName = params.get("roomName") || "";
  const isAdmin = params.get("isAdmin") === "true";
  const hq = params.get("hq") === "true";
  const preJoinChoices = useMemo(() => {
    const choices = params.get("preJoinChoices");
    return choices ? (JSON.parse(choices) as LocalUserChoices | null) : null;
  }, [params]);

  // store everything in state
  const [roomState,] = React.useState({
    slug,
    token,
    wsUrl,
    roomName,
    isAdmin,
    hq,
    preJoinChoices
  });

  useEffect(() => {
    if (!roomState.wsUrl) {
      void router.push(`/join/${slug}`);
    }
  }, [router, slug, roomState.wsUrl]);

  return { ...roomState };
};


const useRoomOptions = (preJoinChoices: LocalUserChoices | null, hq: boolean): RoomOptions => {
  return useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: preJoinChoices?.videoDeviceId ?? undefined,
        resolution: hq ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        videoSimulcastLayers: hq
          ? [VideoPresets.h1080, VideoPresets.h720]
          : [VideoPresets.h360, VideoPresets.h180],
        stopMicTrackOnMute: true,
      },
      audioCaptureDefaults: {
        deviceId: preJoinChoices?.audioDeviceId ?? undefined,
      },
      adaptiveStream: {
        pauseWhenNotVisible: true,
        pauseVideoInBackground: true,
      },
      dynacast: false,
    };
  }, [preJoinChoices, hq]);
};

const RoomWrapper: NextPage = () => {
  const router = useRouter();
  const { slug, token, wsUrl, roomName, isAdmin, hq, preJoinChoices } = useRoomParams();

  const roomOptions = useRoomOptions(preJoinChoices, hq);

  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname);
  }, [router, slug]);

  const onDisconnected = async () => {
    if (isAdmin) {
      try {
        await axios.post(
          "/api/deleteRoom",
          { slug },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error deleting room:", error);
        // Optionally handle the error, e.g., show a notification
      }
    }
    void router.push("/");
  };

  return (
    <>
      {wsUrl ? (
        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          options={roomOptions}
          video={preJoinChoices?.videoEnabled}
          audio={preJoinChoices?.audioEnabled}
          onDisconnected={onDisconnected}
          activityModalEnabled
        >
          {/* This div might not be necessary as the server URL is passed to LiveKitRoom */}
          {/* <div
            id="test-server-url"
            style={{
              display: "none",
            }}
          >
            {wsUrl}
          </div> */}

          <WrappedLiveKitRoom
            roomName={roomName}
            slug={slug}
            isAdmin={isAdmin}
            preJoinChoices={preJoinChoices}
            token={token}
          />
        </LiveKitRoom>
      ) : null}

      <Footer />
    </>
  );
};

interface WrappedLiveKitRoomProps {
  isAdmin?: boolean;
  slug: string;
  roomName: string;
  preJoinChoices: LocalUserChoices | null;
  token: string;
}

const USER_JOINED_SOUND_PATH = "/sounds/user-joined.mp3";
const USER_JOINED_DEBOUNCE_DELAY = 1000;

const debouncedPlay = debounce(() => {
  void new Audio(USER_JOINED_SOUND_PATH).play();
}, USER_JOINED_DEBOUNCE_DELAY);

const WrappedLiveKitRoom = ({
  isAdmin,
  slug,
  roomName,
  preJoinChoices,
  token
}: WrappedLiveKitRoomProps) => {
  const isMobile = useMemo(() => isMobileBrowser(), []);
  const chatContext = useChat();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    const handleParticipantConnected = () => {
      void debouncedPlay();
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room]);

  const handleAdminAction = async (method: "mute" | "kick", participantIdentity: string, trackSid?: string) => {
    try {
      await axios.post(
        "/api/admin",
        {
          method,
          participantIdentity,
          trackSid,
          room: slug,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(`Error performing admin action (${method}):`, error);
      // Optionally handle the error, e.g., show a notification
    }
  };

  const onMute = isAdmin
    ? (participantIdentity: string, trackSid: string) =>
      void handleAdminAction("mute", participantIdentity, trackSid)
    : undefined;

  const onKick = isAdmin
    ? (participantIdentity: string) => void handleAdminAction("kick", participantIdentity)
    : undefined;

  return (
    <>
      <RoomNavBar
        token={token}
        roomName={roomName}
        slug={slug}
        iconFull={!isMobile}
        isAdmin={isAdmin}
      />

      <VideoConference
        chatMessageFormatter={formatChatMessageLinks}
        onKick={onKick}
        onMute={onMute}
        isAdmin={isAdmin}
        localIdentity={localParticipant.identity}
        gridLayouts={GRID_LAYOUTS}
        chatContext={chatContext}
        languageOptions={languageOptions}
        supportedChatMessageTypes={['text', 'transcription']}
      />

      <DebugMode
        logLevel={
          process.env.NODE_ENV === "development"
            ? LogLevel.debug
            : LogLevel.info
        }
      />

      {token && (
        <VoiceRecognition
          token={token}
          language={preJoinChoices?.language}
          chatContext={chatContext}
        />
      )}
    </>
  );
};

// Moved GRID_LAYOUTS closer to where it's used (VideoConference)
const GRID_LAYOUTS: GridLayoutDefinition[] = [
  {
    columns: 1,
    rows: 1,
    name: "1x1",
    minTiles: 1,
    maxTiles: 1,
    minWidth: 0,
    minHeight: 0,
  },
  {
    columns: 1,
    rows: 2,
    name: "1x2",
    minTiles: 2,
    maxTiles: 2,
    minWidth: 0,
    minHeight: 0,
  },
  {
    columns: 2,
    rows: 1,
    name: "2x1",
    minTiles: 2,
    maxTiles: 2,
    minWidth: 900,
    minHeight: 0,
  },
  {
    columns: 2,
    rows: 2,
    name: "2x2",
    minTiles: 3,
    maxTiles: 4,
    minWidth: 560,
    minHeight: 0,
  },
  {
    columns: 3,
    rows: 2,
    name: "3x2",
    minTiles: 5,
    maxTiles: 6,
    minWidth: 700,
    minHeight: 0,
  },
  {
    columns: 4,
    rows: 3,
    name: "4x3",
    minTiles: 6,
    maxTiles: 12,
    minWidth: 960,
    minHeight: 0,
  },
];

export default RoomWrapper;
