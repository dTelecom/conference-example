import type { ReactNode } from "react";
import * as React from "react";
import clsx from "clsx";
import styles from "./ButtonWithToolTop.module.scss";

interface ButtonWithToolTip {
  onClick: () => void;
  text: string;
  icon: ReactNode;
}

const ButtonWithToolTip = ({ onClick, text, icon }: ButtonWithToolTip) => {
  return <button
    onClick={onClick}
    style={{ position: "initial" }}
    className={clsx(styles.tooltip, "lk-button lk-participant-metadata-item lk-focus-toggle-button")}
  >
    <div className={styles.tooltiptext}>{text}</div>
    {icon}
  </button>;
};

export default ButtonWithToolTip;
