import Link from "next/link";
import React from "react";
import { LogoIcon, LogoSmallIcon } from "@/assets";
import styles from "./NavBar.module.scss";
import { clsx } from "clsx";

interface Props extends React.PropsWithChildren {
  title?: string;
  small?: boolean;
}

export function NavBar({ title, small, children }: Props) {
  return (
    <header className={clsx(styles.container, small && styles.small)}>
      <Link
        href="/"
        className={styles.link}
        style={{
          justifyContent: !title && !children ? "center" : undefined
        }}
      >
        {small ? <LogoSmallIcon /> : <LogoIcon />}
      </Link>

      {title && (
        <h2>{title}</h2>
      )}

      {children && (
        <div className={styles.children}>
          {children}
        </div>
      )}
    </header>
  );
}
