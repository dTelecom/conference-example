import { NextRequest } from 'next/server';

export function getClientIP(req: NextRequest): string | undefined {
  // Cloudflare-specific header
  if (req.headers.get('cf-connecting-ip')) {
    return req.headers.get('cf-connecting-ip') as string;
  }

  // Standard proxy header
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const forwardedIps = forwardedFor.split(',');
    return forwardedIps[0].trim();
  }

  return undefined;
}
