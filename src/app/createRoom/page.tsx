"use client";

import type { LocalUserChoices } from "@dtelecom/components-react";
import { PreJoin } from "@dtelecom/components-react";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import axios from "axios";
import type { IGetWsUrl } from "@/app/api/getWsUrl/route";
import styles from "./CreateRoom.module.scss";
import { languageOptions } from "@/lib/languageOptions";
import { getCookie, setCookie } from "@/app/actions";
import { defaultPreJoinChoices } from "@/lib/constants";
import { LoginButton } from "@/lib/dtel-auth/components";
import { IsAuthorizedWrapper } from "@/lib/dtel-auth/components/IsAuthorizedWrapper";
import { Leaderboard } from "@/lib/dtel-common/Leaderboard/Leaderboard";
import { isMobileBrowser } from "@dtelecom/components-core";

const CreateRoomPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const isMobile = React.useMemo(() => isMobileBrowser(), []);
  const [roomName] = useState<string>(params.get("roomName") || "");
  const [preJoinChoices, setPreJoinChoices] = useState<
    Partial<LocalUserChoices>
  >();

  const [wsUrl, setWsUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCookie("username").then((cookie) => {
      setPreJoinChoices(() => ({
        ...defaultPreJoinChoices,
        username: cookie || ""
      }));
    }).catch(() => {
      setPreJoinChoices(() => (defaultPreJoinChoices));
    });

    async function fetchWsUrl() {
      try {
        const { data } = await axios.get<IGetWsUrl>(`/api/getWsUrl?_${new Date().getTime()}`);
        setWsUrl(data.wsUrl);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchWsUrl();
  }, [router]);

  const onCreate = async (values: Partial<LocalUserChoices>) => {
    try {
      console.log("Joining with: ", values);
      setIsLoading(true);
      const { data } = await axios.post(`/api/createAndJoinRoom`, {
        wsUrl,
        name: values?.username || "",
        roomName,
        language: values?.language || "en"
      });
      await setCookie("username", values?.username || "", window.location.origin);

      router.push(
        `/room/${data.slug}?token=${data.token}&wsUrl=${data.url}&preJoinChoices=${encodeURIComponent(
          JSON.stringify(values)
        )}&roomName=${roomName}&isAdmin=${data.isAdmin}`
      );
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
        title={roomName}
        small
        iconFull={!isMobile}
        divider
        smallTitle={isMobile}
      >
        <ParticipantsBadge count={0} />
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
            void onCreate(values);
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
export default CreateRoomPage;
