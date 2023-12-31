import React, { useMemo, useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { ParticipantsBadge } from "@/components/ui/ParticipantsBadge/ParticipantsBadge";
import { Button } from "@/components/ui";
import { clsx } from "clsx";
import { ChainIcon, TickIcon } from "@/assets";
import styles from "./RoomNavBar.module.scss";
import { useTracks } from "@dtelecom/components-react";
import { RoomEvent, Track } from "@dtelecom/livekit-client";

interface RoomNavBarProps {
  slug: string;
  roomName: string;
  iconFull?: boolean;
}

export const RoomNavBar = ({ slug, roomName, iconFull }: RoomNavBarProps) => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged] }
  );
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = encodeURI(`${window.location.origin}/join/${slug}?roomName=${roomName}`);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const count = useMemo(() => {
    return tracks.length;
  }, [tracks]);

  return (
    <NavBar
      title={roomName}
      small
      iconFull={iconFull}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}
      >
        <ParticipantsBadge count={count} />

        <Button
          onClick={() => {
            void copy();
          }}
          className={clsx("lk-button", styles.copyButton, copied && styles.copied)}
          size={"sm"}
          variant={"default"}
        >
          {copied ? <TickIcon/> : <ChainIcon />}{copied ? "Copied" : "Copy invite link"}
        </Button>
      </div>
    </NavBar>
  );
};
