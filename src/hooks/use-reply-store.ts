import { create } from "zustand";
import { MemberWithProfile } from "@/types";

interface ReplyMessage {
  id: string;
  content: string;
  member: MemberWithProfile;
}

interface ReplyStore {
  replyTo: ReplyMessage | null;
  channelId: string | null;
  setReplyTo: (message: ReplyMessage | null, channelId?: string) => void;
  clearReply: () => void;
}

export const useReplyStore = create<ReplyStore>((set) => ({
  replyTo: null,
  channelId: null,
  setReplyTo: (message, channelId) =>
    set({ replyTo: message, channelId: channelId || null }),
  clearReply: () => set({ replyTo: null, channelId: null }),
}));
