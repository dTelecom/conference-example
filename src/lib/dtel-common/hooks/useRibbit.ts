import { useEffect } from "react";
import rybbit from "@rybbit/js";

export const useRibbit = () => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      rybbit.init({
        analyticsHost: "https://app.rybbit.io/api",
        siteId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
        maskPatterns: ["/join/**", "/room/**", "/createRoom/**"]
      });
    }
  }, []);
};
