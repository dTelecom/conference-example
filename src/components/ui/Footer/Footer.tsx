import styles from "./Footer.module.scss";
import { DiscordIcon, DtelecomIcon, TwitterIcon } from "@/assets";
import React from "react";

export const Footer = () => {
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
        <a target={"_blank"} href={"https://twitter.com/DTEL_org"}>
          <TwitterIcon />
        </a>
        <a target={"_blank"} href={"https://discord.gg/VSSG2zQsJr"}>
          <DiscordIcon />
        </a>
      </div>
    </div>
  );
};
