import { getClientIP } from '@/lib/getClientIp';
import { NextRequest } from 'next/server';

const { AccessToken } = require("@dtelecom/server-sdk-js");

export const getWsUrl = async (req: NextRequest) => {
  const clientIp = getClientIP(req) || undefined;
  const token = new AccessToken();
  return await token.getWsUrl(clientIp);
};
