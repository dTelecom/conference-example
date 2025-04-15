import type { LocalUserChoices } from "@dtelecom/components-react";
import { PreJoin } from "@dtelecom/components-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import type { GetServerSideProps } from "next";
import { Footer } from "@/components/ui/Footer/Footer";
import axios from "axios";
import type { IJoinResponse } from "@/pages/api/join";
import { isMobileBrowser } from "@dtelecom/components-core";
import type { IGetWsUrl } from "@/pages/api/getWsUrl";
import styles from "./Join.module.scss";
import { languageOptions } from "@/lib/languageOptions";
import { IGetRoomResponse } from "@/pages/api/getRoom";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";

interface Props {
  slug: string;
  roomName: string;
}

const JoinRoomPage = ({ slug, roomName: name }: Props) => {
  const router = useRouter();
  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  const [preJoinChoices, setPreJoinChoices] = useState<
    Partial<LocalUserChoices>
  >({
    username: "",
    videoEnabled: true,
    audioEnabled: process.env.NODE_ENV !== "development"
  });

  const [roomName] = useState<string>(name);
  const [wsUrl, setWsUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [participantsCount, setParticipantsCount] = useState<number>();

  useEffect(() => {
    async function fetchRoom() {
      const { data } = await axios.post<IGetRoomResponse>(`/api/getRoom?slug=${slug}`);
      setParticipantsCount(data.participantsCount || 0);
    }

    async function fetchWsUrl() {
      try {
        const { data } = await axios.get<IGetWsUrl>(`/api/getWsUrl`);
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
    const { data } = await axios.post<IJoinResponse>(`/api/join`, {
      wsUrl,
      slug,
      name: values?.username || "",
    });

    await router.push({
      pathname: `/room/${data.slug}`,
      query: {
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify(values),
        roomName: data.roomName || name
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
        title={roomName || name}
        small
        iconFull={!isMobile}
      >
        {participantsCount !== undefined ? (
          <ParticipantsBadge count={participantsCount} />
        ) : <div />}
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

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return Promise.resolve({
    props: {
      slug: params?.slug as string,
      roomName: (query?.roomName as string) || "",
    },
  });
};

export default JoinRoomPage;
