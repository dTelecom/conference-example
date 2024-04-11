import styles from "./Footer.module.scss";
import { DiscordIcon, DtelecomIcon, TwitterIcon } from "@/assets";
import React from "react";
import { isMobileBrowser } from "@dtelecom/components-core";

export const Footer = () => {
  const isMobile = React.useMemo(() => isMobileBrowser(), []);
  const onClick = () => {
    window.open("https://dtelecom.org/", "_blank");
  };

  return (
    <div className={styles.container}>
      <div onClick={onClick}>
        Powered by
        <DtelecomIcon />
      </div>
      <div className={styles.social}>
        {isMobile && (
          <a target={"_blank"} href={"https://docs.dmeet.org"}>
            Docs
          </a>
        )}
        <a target={"_blank"} href={"https://twitter.com/DTEL_org"}>
          <TwitterIcon />
        </a>
        <a target={"_blank"} href={"https://discord.gg/VSSG2zQsJr"}>
          <DiscordIcon />
        </a>
        {!isMobile && (
          <a target={"_blank"} href={"https://docs.dmeet.org"}>
            Docs
          </a>
        )}
      </div>
    </div>
  );
};
