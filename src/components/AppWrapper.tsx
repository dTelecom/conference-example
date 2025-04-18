import React, { PropsWithChildren } from 'react';
import useInviteCode from '@/lib/hooks/useInviteCode';
import { AuthProvider } from '@/lib/dtel-auth/components';
import { ThemeProvider } from 'next-themes';

const AppWrapper = ({ children }: PropsWithChildren) => {
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
