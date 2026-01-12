import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // Appearance
  accentColor: string;
  backgroundColor: string; // New - background theme color
  fontSize: number;
  messageDisplay: "compact" | "cozy";
  
  // Voice
  selectedAudioInput: string;
  selectedAudioOutput: string;
  selectedVideoInput: string;
  inputVolume: number;
  outputVolume: number;
  screenShareQuality: "480" | "720" | "1080";
  
  // Notifications
  desktopNotifications: boolean;
  soundNotifications: boolean;
  mentionNotifications: boolean;
  dmNotifications: boolean;
  serverNotifications: boolean;
  notificationSounds: {
    message: boolean;
    mention: boolean;
    join: boolean;
    leave: boolean;
    call: boolean;
    deafen: boolean;
  };
  
  // Actions
  setAccentColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setFontSize: (size: number) => void;
  setMessageDisplay: (display: "compact" | "cozy") => void;
  
  setSelectedAudioInput: (deviceId: string) => void;
  setSelectedAudioOutput: (deviceId: string) => void;
  setSelectedVideoInput: (deviceId: string) => void;
  setInputVolume: (volume: number) => void;
  setOutputVolume: (volume: number) => void;
  setScreenShareQuality: (quality: "480" | "720" | "1080") => void;
  
  setDesktopNotifications: (enabled: boolean) => void;
  setSoundNotifications: (enabled: boolean) => void;
  setMentionNotifications: (enabled: boolean) => void;
  setDmNotifications: (enabled: boolean) => void;
  setServerNotifications: (enabled: boolean) => void;
  setNotificationSound: (sound: keyof SettingsState["notificationSounds"], enabled: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      accentColor: "indigo",
      backgroundColor: "dark", // dark, darker, midnight, amoled
      fontSize: 14,
      messageDisplay: "cozy",
      
      selectedAudioInput: "",
      selectedAudioOutput: "",
      selectedVideoInput: "",
      inputVolume: 80,
      outputVolume: 100,
      screenShareQuality: "720",
      
      desktopNotifications: true,
      soundNotifications: true,
      mentionNotifications: true,
      dmNotifications: true,
      serverNotifications: false,
      notificationSounds: {
        message: true,
        mention: true,
        join: true,
        leave: true,
        call: true,
        deafen: true,
      },
      
      // Actions
      setAccentColor: (color) => set({ accentColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setFontSize: (size) => set({ fontSize: size }),
      setMessageDisplay: (display) => set({ messageDisplay: display }),
      
      setSelectedAudioInput: (deviceId) => set({ selectedAudioInput: deviceId }),
      setSelectedAudioOutput: (deviceId) => set({ selectedAudioOutput: deviceId }),
      setSelectedVideoInput: (deviceId) => set({ selectedVideoInput: deviceId }),
      setInputVolume: (volume) => set({ inputVolume: volume }),
      setOutputVolume: (volume) => set({ outputVolume: volume }),
      setScreenShareQuality: (quality) => set({ screenShareQuality: quality }),
      
      setDesktopNotifications: (enabled) => set({ desktopNotifications: enabled }),
      setSoundNotifications: (enabled) => set({ soundNotifications: enabled }),
      setMentionNotifications: (enabled) => set({ mentionNotifications: enabled }),
      setDmNotifications: (enabled) => set({ dmNotifications: enabled }),
      setServerNotifications: (enabled) => set({ serverNotifications: enabled }),
      setNotificationSound: (sound, enabled) =>
        set((state) => ({
          notificationSounds: {
            ...state.notificationSounds,
            [sound]: enabled,
          },
        })),
    }),
    {
      name: "echo-settings",
    }
  )
);
