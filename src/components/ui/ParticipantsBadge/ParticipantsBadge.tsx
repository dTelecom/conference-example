import { ParticipantsIcon } from "@/assets";
import React from "react";
import styles from "./ParticipantsBadge.module.scss";

interface Props {
  count: number;
}

export const ParticipantsBadge = ({ count }: Props) => {
  return (
    <div className={styles.participants}>
      <div className={styles.participantsBadge}><ParticipantsIcon />{count}</div>
    </div>
  );
};
