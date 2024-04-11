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
import type { IGetRoomResponse } from "@/pages/api/getRoom";
import { getIdentity, setIdentity } from "@/lib/client-utils";
import { isMobileBrowser } from "@dtelecom/components-core";
import type { IGetWsUrl } from "@/pages/api/getWsUrl";
import { hasWallets } from "@/pages/_app";
import { CustomConnectButton } from "@/components/ui/CustomConnectButton/CustomConnectButton";
import { setInviteCode } from "@/lib/hooks/useInviteCode";
import styles from "./Join.module.scss";

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
    audioEnabled: process.env.NODE_ENV !== "development",
  });

  const [roomName, setRoomName] = useState<string>();
  const [participantsCount, setParticipantsCount] = useState<number>();
  const [wsUrl, setWsUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoom() {
      const { data } = await axios.get<IGetRoomResponse>(
        `/api/getRoom?slug=${slug}`
      );
      if (data.roomDeleted) {
        void router.push("/");
      }
      setParticipantsCount(data.participantsCount);
      setRoomName(data.roomName);

      if (data.referralCode) {
        setInviteCode(data.referralCode);
      }
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
      identity: getIdentity(slug) || "",
    });

    setIdentity(slug, data.identity);

    await router.push({
      pathname: `/room/${data.slug}`,
      query: {
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify(values),
        roomName: data.roomName || name,
        isAdmin: data.isAdmin,
      },
    });

    setIsLoading(false);
  };

  if (roomName === undefined) {
    return null;
  }

  return (
    <>
      <NavBar title={isMobile ? "" : roomName || name} small iconFull>
        {!isMobile && participantsCount !== undefined && (
          <ParticipantsBadge count={participantsCount} />
        )}
        <div style={{ marginLeft: "8px" }} />
        {hasWallets && <CustomConnectButton />}
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

const languageOptions = [
  { name: "Bulgarian", code: "bg", flagIsoCode: "bg" },
  { name: "Czech", code: "cs", flagIsoCode: "cz" },
  { name: "Danish", code: "da", flagIsoCode: "dk" },
  { name: "Dutch", code: "nl", flagIsoCode: "nl" },
  { name: "English", code: "en", flagIsoCode: "us" },
  { name: "Estonian", code: "et", flagIsoCode: "ee" },
  { name: "French", code: "fr", flagIsoCode: "fr" },
  { name: "German", code: "de", flagIsoCode: "de" },
  { name: "Greek", code: "el", flagIsoCode: "gr" },
  { name: "Hindi", code: "hi", flagIsoCode: "in" },
  { name: "Hungarian", code: "hu", flagIsoCode: "hu" },
  { name: "Indonesian", code: "id", flagIsoCode: "id" },
  { name: "Italian", code: "it", flagIsoCode: "it" },
  { name: "Japanese", code: "ja", flagIsoCode: "jp" },
  { name: "Korean", code: "ko", flagIsoCode: "kr" },
  { name: "Latvian", code: "lv", flagIsoCode: "lv" },
  { name: "Lithuanian", code: "lt", flagIsoCode: "lt" },
  { name: "Malay", code: "ms", flagIsoCode: "my" },
  { name: "Norwegian", code: "no", flagIsoCode: "no" },
  { name: "Polish", code: "pl", flagIsoCode: "pl" },
  { name: "Portuguese", code: "pt", flagIsoCode: "pt" },
  { name: "Romanian", code: "ro", flagIsoCode: "ro" },
  { name: "Russian", code: "ru", flagIsoCode: "ru" },
  { name: "Slovak", code: "sk", flagIsoCode: "sk" },
  { name: "Spanish", code: "es", flagIsoCode: "es" },
  { name: "Swedish", code: "sv", flagIsoCode: "se" },
  { name: "Thai", code: "th", flagIsoCode: "th" },
  { name: "Turkish", code: "tr", flagIsoCode: "tr" },
  { name: "Ukrainian", code: "uk", flagIsoCode: "ua" },
  { name: "Vietnamese", code: "vi", flagIsoCode: "vn" },
];

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
