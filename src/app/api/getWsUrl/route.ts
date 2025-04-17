import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from '@/lib/getClientIp';

const { AccessToken } = require("@dtelecom/server-sdk-js");

export interface IGetWsUrl {
  wsUrl: string;
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIP(req) || undefined;
  const token = new AccessToken();
  const wsUrl = await token.getWsUrl(clientIp);

  return NextResponse.json({
    wsUrl,
    clientIp: clientIp || null,
  });
}
