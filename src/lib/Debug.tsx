import * as React from "react";
import { useRoomContext } from "@dtelecom/components-react";
import { LogLevel, setLogLevel } from "@dtelecom/livekit-client";

function parseLogLevel(): LogLevel {
  const value = Number(process.env.NEXT_PUBLIC_DEBUG);
  return value >= 0 ? value : LogLevel.error;
}

export const useDebugMode = ({ logLevel }: { logLevel?: LogLevel }) => {
  setLogLevel(logLevel ?? "debug");
  const room = useRoomContext();
  React.useEffect(() => {
    // @ts-expect-error custom variable
    window.__lk_room = room;

    return () => {
      // @ts-expect-error custom variable
      window.__lk_room = undefined;
    };
  }, [room]);
};

export const DebugMode = () => {
  const logLevel = parseLogLevel();
  useDebugMode({ logLevel });
  return null;
};
