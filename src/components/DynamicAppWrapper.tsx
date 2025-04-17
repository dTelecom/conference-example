'use client'
import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';

const AppWrapper = dynamic(() => import('./AppWrapper'), {
  ssr: false,
});

 const DynamicAppWrapper = ({children}: PropsWithChildren) => {
  return (
    <AppWrapper>
      {children}
    </AppWrapper>
  )
}
export default DynamicAppWrapper;
