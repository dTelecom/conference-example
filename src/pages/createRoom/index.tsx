import type { LocalUserChoices } from "@dtelecom/components-react";
import { PreJoin } from "@dtelecom/components-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import type { GetServerSideProps } from "next";
import { Footer } from "@/components/ui/Footer/Footer";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import axios from "axios";
import type { IJoinResponse } from "@/pages/api/join";
import type { IGetWsUrl } from "@/pages/api/getWsUrl";
import styles from "./CreateRoom.module.scss";
import { languageOptions } from "@/lib/languageOptions";

interface Props {
  roomName: string;
}

const CreateRoomPage = ({ roomName: name }: Props) => {
  const router = useRouter();

  const [roomName] = useState<string>(name);
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
    const { data } = await axios.post<IJoinResponse>(`/api/createAndJoinRoom`, {
      wsUrl,
      name: values?.username || "",
      roomName,
      language: values?.language || "en"
    });

    await router.push({
      pathname: `/room/${data.slug}`,
      query: {
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify(values),
        roomName,
        isAdmin: data.isAdmin
      }
    });

    setIsLoading(false);
  };

  if (roomName === undefined) {
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

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query
}) => {
  return Promise.resolve({
    props: {
      roomName: (query?.roomName as string) || ""
    }
  });
};

export default CreateRoomPage;
