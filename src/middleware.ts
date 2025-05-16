import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
  default-src 'self';
  script-src 'self' https://challenges.cloudflare.com ${
    process.env.NODE_ENV === "production" ? `'nonce-${nonce}'` : `'unsafe-inline' 'unsafe-eval'`
  } https: http:;
  style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
  img-src 'self' https://explorer-api.walletconnect.com https://upload.wikimedia.org https://*.dmeet.org data: blob:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self'; form-action 'self';
  frame-ancestors 'none';
  child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
  frame-src https://*.dmeet.org https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
  connect-src 'self' https://app.rybbit.io/api/track wss://*.dmeet.org https://*.dmeet.org https://*.dtel.network wss://*.dtel.network https://explorer-api.walletconnect.com https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://api.testnet.solana.com;
  worker-src 'self';
  manifest-src 'self';
  `;

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Set the CSP header so that Next.js can read it and generate tags with the nonce
  requestHeaders.set('content-security-policy', cspHeader.replace(/\n/g, ""));

  // Create new response
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders
    }
  });

  // Also set the CSP header in the response so that it is outputted to the browser
  response.headers.set('content-security-policy', cspHeader.replace(/\n/g, ""));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|favicon.png).*)',
  ],
};
