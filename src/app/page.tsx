"use client";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import styles from "./page.module.scss";
import { Input } from "@/components/ui/Input/Input";
import type { FormEvent } from "react";
import React, { useEffect, useState } from "react";
import { KeyIcon } from "@/assets";
import { Leaderboard } from "@/components/ui/Leaderboard/Leaderboard";
import { LoginButton } from "@/lib/dtel-auth/components";
import { IsAuthorizedWrapper } from "@/lib/dtel-auth/components/IsAuthorizedWrapper";
import { getCookie, setCookie } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function Home() {
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
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

      setCookie("roomName", roomName, window.location.origin);
      push(`/createRoom?roomName=${encodeURIComponent(roomName)}`);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
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

        <LoginButton />
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
          <Button
            type={"submit"}
            variant={"default"}
            size={"lg"}
            className={styles.button}
            disabled={!roomName || isLoading}
          >
            Create a Room
          </Button>
        </form>
      </div>

      <Footer />
    </>
  );
}
