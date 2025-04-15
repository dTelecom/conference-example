"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const INVITE_CODE_LOCAL_STORAGE_KEY = "invite_code_v2";
export const INVITE_CODE_QUERY_KEY = "invite";

export const getInviteCode = () => {
  return window.localStorage.getItem(INVITE_CODE_LOCAL_STORAGE_KEY);
};

export const setInviteCode = (code: string, force: boolean = false) => {
  const codeExists = getInviteCode();
  if (!codeExists || force) {
    window.localStorage.setItem(INVITE_CODE_LOCAL_STORAGE_KEY, code);
  }
};

export default function useInviteCode() {
  const searchParams = useSearchParams();

  const inviteCode = searchParams.get(INVITE_CODE_QUERY_KEY);

  useEffect(() => {
    if (inviteCode && !getInviteCode()) {
      setInviteCode(inviteCode);
    }
  }, [inviteCode]);

  return inviteCode;
}
