import { RoomSettings } from "@/lib/index";

const ROOM_SETTINGS_KEY = "roomSettings";

export const defaultRoomSettings: RoomSettings = {
  joinNotification: true,
  muteMicrophoneOnJoin: true,
  waitingRoom: false
}

export const getRoomSettingsFromLocalStorage: (authenticated: boolean) => RoomSettings = (authenticated) => {
  if (!authenticated) {
    return defaultRoomSettings;
  }

  try {
    const settings = localStorage.getItem(ROOM_SETTINGS_KEY)
    return settings ? JSON.parse(settings) as RoomSettings : defaultRoomSettings;
  } catch (_) {
    return defaultRoomSettings
  }
}

export const setRoomSettings = (settings: RoomSettings) => {
  localStorage.setItem(ROOM_SETTINGS_KEY, JSON.stringify(settings))
}
