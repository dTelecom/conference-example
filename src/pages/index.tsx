import { Button } from "@/components/ui";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import styles from "./Index.module.scss";
import { Input } from "@/components/ui/Input/Input";
import type { FormEvent } from "react";
import { useState } from "react";
import { KeyIcon } from "@/assets";
import axios from "axios";
import { setIdentity } from "@/lib/client-utils";

export default function IndexPage() {
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomName) return;

    try {
      setIsLoading(true);
      const { data } = await axios.post<{ identity: string, slug: string }>("/api/createRoom", { roomName });
      setIdentity(data.slug, data.identity);
      await push({
        pathname: `/join/${data.slug}`,
        query: {
          roomName
        }
      });
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };


  return (
    <>
      <NavBar />

      <div className={styles.container}>
        <h1 className={styles.title}>
          Create a Web3 Meeting
        </h1>
        <p className={styles.text}>
          Open source video conferencing app built on <a href={"https://video.dtelecom.org"}>dTelecom Cloud</a>
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
