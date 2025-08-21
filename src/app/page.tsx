"use client";
import { CheckboxWithText } from "@/components/ui/CheckboxWithText/CheckboxWithText";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import styles from "./page.module.scss";
import { Input } from "@/components/ui/Input/Input";
import type { FormEvent } from "react";
import React, { useEffect, useState } from "react";
import { KeyIcon } from "@/assets";
import { Leaderboard } from "@/lib/dtel-common/Leaderboard/Leaderboard";
import { LoginButton } from "@/lib/dtel-auth/components";
import { IsAuthorizedWrapper } from "@/lib/dtel-auth/components/IsAuthorizedWrapper";
import { getCookie, setCookie } from "@/app/actions";
import { Loader } from "@dtelecom/components-react";
import { RoomSettings } from "@/lib";
import { usePrivy } from "@privy-io/react-auth";
import { getRoomSettingsFromLocalStorage, setRoomSettings } from "@/lib/roomSettings";

export const dynamic = "force-dynamic";

export default function Home() {
  const { authenticated } = usePrivy();
  const [roomName, setRoomName] = useState<string>("");
  const [settings, setSettings] = useState<RoomSettings>(getRoomSettingsFromLocalStorage(authenticated));
  const [isLoading, setIsLoading] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    getCookie("roomName").then((cookie) => {
      setRoomName(cookie || "");
    });
  }, []);

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomName) return;

    try {
      setIsLoading(true);

      await setCookie("roomName", roomName, window.location.origin);
      setRoomSettings(settings)
      push(`/createRoom?roomName=${encodeURIComponent(roomName)}`);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar>
        <IsAuthorizedWrapper>
          <Leaderboard
            buttonStyle={{
              marginRight: "8px"
            }}
          />
        </IsAuthorizedWrapper>

        <LoginButton fullTitle />
      </NavBar>

      <div className={styles.container}>
        <h1 className={styles.title}>
          Create a Web3 Meeting
          <br /> and Get Points
        </h1>
        <p className={styles.text}>
          A free, open-source web application for video{"\n"} conferencing with
          built-in AI voice translation,{"\n"} built on&nbsp;
          <a
            href={"https://video.dtelecom.org"}
            target={"_blank"}
            rel="noreferrer"
          >
            dTelecom Cloud
          </a>
        </p>

        <form onSubmit={(e) => void onCreate(e)}>
          <Input
            placeholder={"Enter a room name"}
            value={roomName}
            setValue={setRoomName}
            startIcon={<KeyIcon />}
          />

          <div
            onClick={!authenticated ? (e) => {
              e.stopPropagation();
              setShowPopUp(true);
              setTimeout(() => setShowPopUp(false), 3000);
            } : undefined}
            className={styles.options}
          >
            <CheckboxWithText
              label={"Join Sound Notification"}
              value={settings.joinNotification}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                joinNotification: value
              }))}
              description={
                "Play a sound when a\nparticipant joins the room."
              }
              disabled={!authenticated}
            />

            <CheckboxWithText
              label={"Mute Microphone on Join"}
              value={settings.muteMicrophoneOnJoin}
              onChange={(value) => setSettings(prev => ({
                ...prev,
                muteMicrophoneOnJoin: value
              }))}
              description={
                "Automatically turns off the\nmicrophone for all participants\nwhen they join the meeting."
              }
              disabled={!authenticated}
            />

            {showPopUp && (
              <div className={styles.popup}>
                {"Please 'Connect' to use this feature"}
              </div>
            )}
          </div>

          <Button
            type={"submit"}
            variant={"default"}
            size={"lg"}
            className={styles.button}
            disabled={!roomName || isLoading || roomName.length < 3}
          >
            {isLoading ? <Loader /> : "Create a Room"}
          </Button>
        </form>
      </div>

      <Footer />
    </>
  );
}
