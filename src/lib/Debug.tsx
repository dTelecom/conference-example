import * as React from "react";
import { useRoomContext } from "@dtelecom/components-react";
import type { LogLevel } from "@dtelecom/livekit-client";
import { setLogLevel } from "@dtelecom/livekit-client";

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
  });
};

export const DebugMode = ({ logLevel }: { logLevel?: LogLevel }) => {
  useDebugMode({ logLevel });
  return <></>;
};
