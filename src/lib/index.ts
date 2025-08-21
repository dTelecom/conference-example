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

export type RoomSettings = {
  joinNotification: boolean;
  muteMicrophoneOnJoin: boolean;
  waitingRoom: boolean;
}

export const roomSettings: Record<string, RoomSettings> = {}
