import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
  default-src 'self';
  script-src 'self' https://challenges.cloudflare.com 'nonce-${nonce}' 'strict-dynamic' https: http: ${
    process.env.NODE_ENV === "production" ? "" : `'unsafe-eval'`
  };
  style-src 'self' https://fonts.googleapis.com 'nonce-${nonce}' 'unsafe-inline';
  img-src 'self' https://explorer-api.walletconnect.com https://upload.wikimedia.org data: blob:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self'; form-action 'self';
  frame-ancestors 'none';
  child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
  frame-src https://*.dmeet.org https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
  connect-src 'self' https://*.dmeet.org https://*.dtel.network wss://*.dtel.network https://explorer-api.walletconnect.com https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://api.testnet.solana.com;
  worker-src 'self';
  manifest-src 'self';
  `;

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader.replace(/\n/g, ""));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};
