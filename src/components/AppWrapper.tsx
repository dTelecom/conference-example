import React, { PropsWithChildren } from 'react';
import useInviteCode from '@/lib/hooks/useInviteCode';
import { AuthProvider } from '@/lib/dtel-auth/components';
import { ThemeProvider } from 'next-themes';
import { useRibbit } from "@/lib/dtel-common/hooks/useRibbit";

const AppWrapper = ({ children }: PropsWithChildren) => {
  useRibbit();
  useInviteCode();

  return (
    <AuthProvider>
      <ThemeProvider forcedTheme={"dark"}>
        <main data-lk-theme="default">{children}</main>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppWrapper;
