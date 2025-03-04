import React, { useMemo, useState } from "react";
import { NavBar } from "@/components/ui/NavBar/NavBar";
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
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: true },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged] }
  );

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = encodeURI(
      `${window.location.origin}/join/${slug}?roomName=${roomName}`
    );
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const count = useMemo(() => {
    const identities = Array.from(new Set(tracks.map((t) => t.participant.identity)));
    return identities.length;
  }, [tracks]);

  return (
    <NavBar title={roomName} small iconFull={iconFull}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <ParticipantsBadge count={count} />

        <Button
          onClick={() => {
            void copy();
          }}
          className={clsx(
            "lk-button",
            styles.copyButton,
            copied && styles.copied
          )}
          size={"sm"}
          variant={"default"}
        >
          <span>{copied ? <TickIcon /> : <ChainIcon />}</span>
          <span>{copied ? "Copied" : "Copy invite link"}</span>
        </Button>
      </div>
    </NavBar>
  );
};
