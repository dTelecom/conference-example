import type { LocalUserChoices } from "@dtelecom/components-react";
import {
  formatChatMessageLinks,
  LiveKitRoom,
  VideoConference,
} from "@dtelecom/components-react";
import React, { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import type { RoomOptions } from "@dtelecom/livekit-client";
import { LogLevel, VideoPresets } from "@dtelecom/livekit-client";
import { useRouter } from "next/router";
import { DebugMode } from "@/lib/Debug";
import { Footer } from "@/components/ui/Footer/Footer";
import axios from "axios";
import { RoomNavBar } from "@/components/ui/RoomNavBar/RoomNavBar";
import { getIdentity } from "@/lib/client-utils";
import type { GridLayoutDefinition } from "@dtelecom/components-core";
import { isMobileBrowser } from "@dtelecom/components-core";

interface Props {
  slug: string;
  token: string;
  wsUrl: string;
  preJoinChoices: LocalUserChoices | null;
  roomName: string;
  isAdmin?: boolean;
}

const RoomWrapper: NextPage<Props> = ({
  slug,
  roomName,
  isAdmin,
  preJoinChoices,
  wsUrl,
  token,
}) => {
  const router = useRouter();
  const [identity, setIdentity] = useState<string>();
  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  useEffect(() => {
    setIdentity(getIdentity(slug));

    void router.replace(router.pathname.replace("[slug]", slug), undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!wsUrl) {
      void router.push(`/join/${slug}`);
    }
  }, [router, slug, wsUrl]);

  const { hq } = router.query;
  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: preJoinChoices?.videoDeviceId ?? undefined,
        resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        videoSimulcastLayers:
          hq === "true"
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h360, VideoPresets.h180],
      },
      audioCaptureDefaults: {
        deviceId: preJoinChoices?.audioDeviceId ?? undefined,
      },
      adaptiveStream: {
        pauseWhenNotVisible: true,
        updateDimensions: false,
      },
      dynacast: false,
    };
  }, [preJoinChoices, hq]);

  const onMute = async (participantIdentity: string, trackSid: string) => {
    await axios.post("/api/admin", {
      method: "mute",
      adminIdentity: identity,
      participantIdentity,
      trackSid,
      room: slug,
    });
  };

  const onKick = async (participantIdentity: string) => {
    await axios.post("/api/admin", {
      method: "kick",
      adminIdentity: identity,
      participantIdentity,
      room: slug,
    });
  };

  const onDisconnected = async () => {
    if (isAdmin) {
      await axios.post("/api/deleteRoom", { slug, identity });
    }

    void router.push("/");
  };

  return (
    <>
      {wsUrl && (
        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          options={roomOptions}
          video={preJoinChoices?.videoEnabled}
          audio={preJoinChoices?.audioEnabled}
          onDisconnected={() => void onDisconnected()}
        >
          <div
            id="test-server-url"
            style={{
              display: "none",
            }}
          >
            {wsUrl}
          </div>

          <RoomNavBar roomName={roomName} slug={slug} iconFull={!isMobile} />

          <VideoConference
            chatMessageFormatter={formatChatMessageLinks}
            onKick={isAdmin ? onKick : undefined}
            onMute={isAdmin ? onMute : undefined}
            isAdmin={isAdmin}
            localIdentity={identity}
            gridLayouts={GRID_LAYOUTS}
          />

          <DebugMode
            logLevel={
              process.env.NODE_ENV === "development"
                ? LogLevel.debug
                : LogLevel.info
            }
          />
        </LiveKitRoom>
      )}

      <Footer />
    </>
  );
};

export default RoomWrapper;

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  const preJoinChoices: LocalUserChoices | null = query?.preJoinChoices
    ? (JSON.parse(query.preJoinChoices as string) as LocalUserChoices)
    : null;
  return Promise.resolve({
    props: {
      slug: params?.slug as string,
      token: (query?.token || "") as string,
      wsUrl: (query?.wsUrl || "") as string,
      preJoinChoices,
      roomName: (query?.roomName || "") as string,
      isAdmin: query?.isAdmin === "true",
    },
  });
};

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
