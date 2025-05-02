import Link from "next/link";
import React from "react";
import { LogoIcon, LogoSmallIcon } from "@/assets";
import styles from "./NavBar.module.scss";
import { clsx } from "clsx";

interface Props extends React.PropsWithChildren {
  title?: string;
  small?: boolean;
  iconFull?: boolean;
  divider?: boolean;
}

export function NavBar({ title, small, iconFull, divider, children }: Props) {
  const dividerElement = divider ? <div className={styles.divider} /> : null;
  const childrenWithDivider = React.Children.map(children, (child, index) => {
    if (index === 0) return child;
    return (
      <>
        {dividerElement}
        {child}
      </>
    );
  });

  return (
    <header className={clsx(styles.container, small && styles.small)}>
      <Link
        href="/"
        target="_blank"
        className={styles.link}
        style={{
          justifyContent: !title && !children ? "center" : undefined,
        }}
      >
        {small && !iconFull ? <LogoSmallIcon /> : <LogoIcon />}
      </Link>

      {title && <h2>{title}</h2>}

      {children && <div className={styles.children}>{childrenWithDivider}</div>}
    </header>
  );
}
