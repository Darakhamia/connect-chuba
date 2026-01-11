"use client";

import { create } from "zustand";

interface VoiceState {
  // Текущий голосовой канал
  activeChannelId: string | null;
  activeChannelName: string | null;
  activeServerId: string | null;
  activeServerName: string | null;
  isVideo: boolean;
  
  // Действия
  joinVoice: (data: {
    channelId: string;
    channelName: string;
    serverId: string;
    serverName: string;
    isVideo: boolean;
  }) => void;
  leaveVoice: () => void;
}

export const useVoice = create<VoiceState>((set) => ({
  activeChannelId: null,
  activeChannelName: null,
  activeServerId: null,
  activeServerName: null,
  isVideo: false,
  
  joinVoice: (data) => set({
    activeChannelId: data.channelId,
    activeChannelName: data.channelName,
    activeServerId: data.serverId,
    activeServerName: data.serverName,
    isVideo: data.isVideo,
  }),
  
  leaveVoice: () => set({
    activeChannelId: null,
    activeChannelName: null,
    activeServerId: null,
    activeServerName: null,
    isVideo: false,
  }),
}));
