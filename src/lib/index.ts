export const roomParticipants: Record<string, {
  count: number;
  createdAt: number;
  adminWsUrl?: string;
}> = {};

export interface JwtKey {
  iss: string;
  video: {
    roomAdmin: boolean;
  };
}
