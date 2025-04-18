export const roomParticipants: Record<string, {
  count: number;
  createdAt: number;
}> = {};

export interface JwtKey {
  iss: string;
  video: {
    roomAdmin: boolean;
  };
}
