import { useRoomContext } from "@livekit/components-react";
import React, { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import { Button } from "@/components/ui";
import { clsx } from "clsx";
import { ChainIcon } from "@/assets";
import styles from "./RoomNavBar.module.scss";

interface RoomNavBarProps {
  slug: string;
  roomName: string;
}

export const RoomNavBar = ({ slug, roomName }: RoomNavBarProps) => {
  const room = useRoomContext();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/join/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const participantsCount: number = room?.roomInfo?.numParticipants as number || 0;

  return (
    <NavBar
      title={roomName}
      small
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}
      >
        <ParticipantsBadge count={participantsCount} />

        <Button
          onClick={() => {
            void copy();
          }}
          className={clsx("lk-button", styles.copyButton)}
          size={"sm"}
        >
          <ChainIcon />{copied ? "Copied" : "Copy invite link"}
        </Button>
      </div>
    </NavBar>
  );
};
