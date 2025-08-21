"use client";

import type { LocalUserChoices } from "@dtelecom/components-react";
import { PreJoin } from "@dtelecom/components-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import axios from "axios";
import { isMobileBrowser } from "@dtelecom/components-core";
import styles from "./Join.module.scss";
import { languageOptions } from "@/lib/languageOptions";
import { IGetRoomResponse } from "@/app/api/getRoom/route";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import { getCookie, setCookie } from "@/app/actions";
import { defaultPreJoinChoices } from "@/lib/constants";
import { IsAuthorizedWrapper } from "@/lib/dtel-auth/components/IsAuthorizedWrapper";
import { Leaderboard } from "@/lib/dtel-common/Leaderboard/Leaderboard";
import { LoginButton } from "@/lib/dtel-auth/components";
import { RoomSettings } from "@/lib";

const JoinRoomPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const params = useSearchParams();
  const name = params.get("roomName") || "";
  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  const [preJoinChoices, setPreJoinChoices] = useState<
    Partial<LocalUserChoices>
  >();

  const [roomName] = useState<string>(name);
  const [wsUrl, setWsUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [participantsCount, setParticipantsCount] = useState<number>();
  const [roomSettings, setRoomSettings] = useState<RoomSettings>();

  useEffect(() => {
    getCookie("username").then((cookie) => {
      setPreJoinChoices(() => ({
        ...defaultPreJoinChoices,
        username: cookie || ""
      }));
    }).catch(() => {
      setPreJoinChoices(() => (defaultPreJoinChoices));
    });

    async function fetchRoom() {
      const { data } = await axios.post<IGetRoomResponse>(`/api/getRoom?slug=${slug}`);
      setParticipantsCount(data.participantsCount || 0);
      setRoomSettings(data.settings);
    }

    async function fetchWsUrl() {
      try {
        const { data } = await axios.get(`/api/getWsUrl?slug=${slug}`);
        setWsUrl(data.wsUrl);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchRoom();
    void fetchWsUrl();
  }, [router, slug]);

  const onJoin = async (values: Partial<LocalUserChoices>) => {
    console.log("Joining with: ", values);
    setIsLoading(true);
    try {

      const { data } = await axios.post(`/api/join`, {
        wsUrl,
        slug,
        name: values?.username || ""
      });
      await setCookie("username", values?.username || "", window.location.origin);

      const queryParams = {
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify({
          ...values,
          audioEnabled: roomSettings?.muteMicrophoneOnJoin ? false : !!values.audioEnabled
        }),
        roomName: data.roomName || name,
        roomSettings: JSON.stringify(roomSettings)
      };

      router.push(`/room/${data.slug}?` + new URLSearchParams(queryParams).toString());
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  if (roomName === undefined || !preJoinChoices) {
    return null;
  }

  return (
    <>
      <NavBar
        title={roomName || name}
        small
        iconFull={!isMobile}
        divider
        smallTitle={isMobile}
      >
        {participantsCount !== undefined ? (
          <ParticipantsBadge count={participantsCount} />
        ) : <div />}

        <div
          style={{
            display: "flex"
          }}
        >
          <IsAuthorizedWrapper>
            <Leaderboard
              buttonStyle={{
                marginRight: "8px"
              }}
            />
          </IsAuthorizedWrapper>

          <LoginButton />
        </div>
      </NavBar>

      <div className={styles.container}>
        <PreJoin
          onError={(err) => console.log("error while setting up prejoin", err)}
          defaults={preJoinChoices}
          onSubmit={(values) => {
            setPreJoinChoices(values);
            void onJoin(values);
          }}
          onValidate={(values) => {
            if (!values.username || values.username.length < 1 || isLoading) {
              return false;
            }
            return true;
          }}
          userLabel={"Enter your name"}
          isLoading={isLoading}
          languageOptions={languageOptions}
        />
      </div>

      <Footer />
    </>
  );
};

export default JoinRoomPage;
