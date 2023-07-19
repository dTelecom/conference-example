import styles from "./Footer.module.scss";
import { DtelecomIcon } from "@/assets";

export const Footer = () => {
  const onClick = () => {
    window.open("https://dtelecom.org/", "_blank");
  };

  return (
    <div
      onClick={onClick}
      className={styles.container}
    >
      Powered by<DtelecomIcon />
    </div>
  );
};
