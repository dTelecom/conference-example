import React from "react";
import { WalletIcon } from "@/assets";

export const ConnectButtonText = () => {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <WalletIcon />
      Connect
    </span>
  );
};
