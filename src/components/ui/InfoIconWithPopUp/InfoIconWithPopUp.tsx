import { NewInfoIcon } from "@/assets";
import styles from "./InfoIconWithPopUp.module.scss";
import React from "react";

interface InfoIconWithPopUpProps {
  text: string;
  disabled: boolean;
}

export const InfoIconWithPopUp: React.FC<InfoIconWithPopUpProps> = ({ text, disabled }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseLeave={disabled ? undefined : () => setHovered(false)}
      onMouseOver={disabled ? undefined : () => setHovered(true)}
      className={styles.infoIcon}
    >
      <NewInfoIcon />
      {hovered && (
        <div className={styles.popup}>
          <span className={styles.popupText}>{text}</span>
        </div>
      )}
    </div>
  );
};
