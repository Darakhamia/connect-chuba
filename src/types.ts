import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Member, Profile, Server, Message, MessageReaction, DMMessage, DMMessageReaction, Role, MemberRole2 } from "@prisma/client";

// Socket.io types для API responses
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Member с Profile и Custom Roles
export type MemberWithProfile = Member & {
  profile: Profile;
  customRoles?: (MemberRole2 & {
    role: Role;
  })[];
};

// Server с Members и Profiles
export type ServerWithMembersWithProfiles = Server & {
  members: MemberWithProfile[];
  roles?: Role[];
};

// Reply message type (simplified for nested display)
export type ReplyMessage = {
  id: string;
  content: string;
  deleted: boolean;
  member: MemberWithProfile;
};

// Message с Member, Profile, Reactions и Reply
export type MessageWithMemberWithProfile = Message & {
  member: MemberWithProfile;
  reactions: (MessageReaction & {
    member: MemberWithProfile;
  })[];
  replyTo?: ReplyMessage | null;
};

// DM Message с Profile и Reactions
export type DMMessageWithProfile = DMMessage & {
  profile: Profile;
  reactions: (DMMessageReaction & {
    member: MemberWithProfile;
  })[];
};

// For @mentions autocomplete
export type MentionSuggestion = {
  id: string;
  name: string;
  imageUrl: string;
  type: "user" | "role" | "channel";
};
