import { ParticipantsIcon } from "@/assets";
import React from "react";
import styles from "./ParticipantsBadge.module.scss";

interface Props {
  count: number;
}

export const ParticipantsBadge = ({ count }: Props) => {
  return (
    <div className={styles.participants}>
      <span>At the room:</span>
      <div className={styles.participantsBadge}><ParticipantsIcon />{count}</div>
    </div>
  );
};
