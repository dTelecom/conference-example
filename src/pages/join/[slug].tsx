import type { LocalUserChoices } from "@dtelecom/components-react";
import { PreJoin } from "@dtelecom/components-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar";
import type { GetServerSideProps } from "next";
import { Footer } from "@/components/ui/Footer/Footer";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import axios from "axios";
import type { IJoinResponse } from "@/pages/api/join";
import type { IGetRoomResponse } from "@/pages/api/getRoom";
import { getIdentity, setIdentity } from "@/lib/client-utils";
import { isMobileBrowser } from "@livekit/components-core";

interface Props {
  slug: string;
  roomName: string;
}

const JoinRoomPage = ({ slug, roomName: name }: Props) => {
  const router = useRouter();
  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  const [preJoinChoices, setPreJoinChoices] = useState<Partial<LocalUserChoices>>({
    username: "",
    videoEnabled: true,
    audioEnabled: true
  });

  const [roomName, setRoomName] = useState<string>();
  const [participantsCount, setParticipantsCount] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRoom() {
      const { data } = await axios.get<IGetRoomResponse>(`/api/getRoom?slug=${slug}`);
      if (data.roomDeleted) {
        void router.push("/");
      }
      setParticipantsCount(data.participantsCount);
      setRoomName(data.roomName);
    }

    void fetchRoom();
  }, [router, slug]);

  const onJoin = async (values: Partial<LocalUserChoices>) => {
    console.log("Joining with: ", values);
    setIsLoading(true);
    const { data } = await axios.post<IJoinResponse>(`/api/join`, {
      slug,
      name: values?.username || "",
      identity: getIdentity(slug) || ""
    });

    setIdentity(slug, data.identity);

    await router.push({
      pathname: `/room/${data.slug}`,
      query: {
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify(values),
        roomName: data.roomName || name,
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
        title={isMobile ? "" : roomName || name}
        small
        iconFull
      >
        {!isMobile && participantsCount !== undefined && (
          <ParticipantsBadge count={participantsCount} />
        )}
      </NavBar>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
          userLabel={'Enter your name'}
        ></PreJoin>
      </div>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  return Promise.resolve({
    props: {
      slug: params?.slug as string,
      roomName: query?.roomName as string || ""
    }
  });
};

export default JoinRoomPage;
