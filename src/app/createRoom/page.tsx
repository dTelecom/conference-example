'use client';

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
import { getCookie, setCookie } from '@/app/actions';

const CreateRoomPage = () => {
  const router = useRouter();
  const params = useSearchParams()

  const [roomName] = useState<string>(params.get("roomName") || "");
  const [preJoinChoices, setPreJoinChoices] = useState<
    Partial<LocalUserChoices>
  >({
    username: "",
    videoEnabled: true,
    audioEnabled: process.env.NODE_ENV !== "development"
  });

  const [wsUrl, setWsUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCookie('username').then((cookie) => {
      setPreJoinChoices((prev) => ({
        ...prev,
        username: cookie || ''
      }));
      setIsLoading(false)
    });

    async function fetchWsUrl() {
      try {
        const { data } = await axios.get<IGetWsUrl>(`/api/getWsUrl`);
        setWsUrl(data.wsUrl);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchWsUrl();
  }, [router]);

  const onCreate = async (values: Partial<LocalUserChoices>) => {
    console.log("Joining with: ", values);
    setIsLoading(true);
    const { data } = await axios.post(`/api/createAndJoinRoom`, {
      wsUrl,
      name: values?.username || "",
      roomName,
      language: values?.language || "en"
    });
    await setCookie('username', values?.username || '', window.location.origin);

    router.push(
      `/room/${data.slug}?token=${data.token}&wsUrl=${data.url}&preJoinChoices=${encodeURIComponent(
        JSON.stringify(values)
      )}&roomName=${roomName}&isAdmin=${data.isAdmin}`
    );

    setIsLoading(false);
  };

  if (roomName === undefined || isLoading) {
    return null;
  }

  return (
    <>
      <NavBar
        title={roomName}
        small
        iconFull
      >
        <ParticipantsBadge count={0} />

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
