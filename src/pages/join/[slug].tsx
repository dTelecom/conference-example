import type { LocalUserChoices } from "@livekit/components-react";
import { PreJoin } from "@livekit/components-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar";
import type { GetServerSideProps } from "next";
import { Footer } from "@/components/ui/Footer/Footer";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import axios from "axios";
import type { IJoinResponse } from "@/pages/api/join";
import type { Room } from ".prisma/client";

interface Props {
  slug: string;
  identity?: string;
}

const JoinRoomPage = ({ slug, identity }: Props) => {
  const router = useRouter();
  const [preJoinChoices, setPreJoinChoices] = useState<Partial<LocalUserChoices>>({
    username: "",
    videoEnabled: false,
    audioEnabled: false
  });

  const [room, setRoom] = useState<Room>();
  const [participantsCount, setParticipantsCount] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRoom() {
      const { data } = await axios.get<{ participantsCount: number, room: Room }>(`/api/getRoom?slug=${slug}`);
      if (data.room.deleted) {
        void router.push("/");
      }
      setParticipantsCount(data.participantsCount || 0);
      setRoom(data.room);
    }

    void fetchRoom();
  }, [router, slug]);

  const onJoin = async (values: Partial<LocalUserChoices>) => {
    console.log("Joining with: ", values);
    setIsLoading(true);
    const { data } = await axios.post<IJoinResponse>(`/api/join`, {
      slug,
      name: values?.username || "",
      identity: identity || ""
    });

    await router.push({
      pathname: `/room/${data.slug}`,
      query: {
        identity: data.identity,
        token: data.token,
        wsUrl: data.url,
        preJoinChoices: JSON.stringify(values),
        roomName: data.roomName,
        isAdmin: data.isAdmin
      }
    });

    setIsLoading(false);
  };

  if (!room) {
    return null;
  }

  return (
    <>
      <NavBar
        title={room?.name}
        small
      >
        {participantsCount !== undefined && (
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
            if (!values.username || values.username.length < 3 || !room || isLoading) {
              return false;
            }
            return true;
          }}
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
      identity: query?.identity as string ?? null
    }
  });
};

export default JoinRoomPage;
