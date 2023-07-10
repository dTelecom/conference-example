import styles from "./Footer.module.scss";
import { DtelecomIcon } from "@/assets";

export const Footer = () => {
  return (
    <div className={styles.container}>
      Powered by<DtelecomIcon />
    </div>
  );
};
