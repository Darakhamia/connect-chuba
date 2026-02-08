import { create } from "zustand";

interface UnreadState {
  lastRead: Record<string, number>; // channelId -> timestamp
  unreadChannels: Set<string>;
  markRead: (channelId: string) => void;
  markUnread: (channelId: string) => void;
  isUnread: (channelId: string) => boolean;
  loadFromStorage: () => void;
}

export const useUnread = create<UnreadState>((set, get) => ({
  lastRead: {},
  unreadChannels: new Set(),

  markRead: (channelId: string) => {
    const now = Date.now();
    set((state) => {
      const newLastRead = { ...state.lastRead, [channelId]: now };
      const newUnread = new Set(state.unreadChannels);
      newUnread.delete(channelId);
      try {
        localStorage.setItem("channel-last-read", JSON.stringify(newLastRead));
      } catch {}
      return { lastRead: newLastRead, unreadChannels: newUnread };
    });
  },

  markUnread: (channelId: string) => {
    set((state) => {
      const newUnread = new Set(state.unreadChannels);
      newUnread.add(channelId);
      return { unreadChannels: newUnread };
    });
  },

  isUnread: (channelId: string) => {
    return get().unreadChannels.has(channelId);
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem("channel-last-read");
      if (stored) {
        set({ lastRead: JSON.parse(stored) });
      }
    } catch {}
  },
}));
