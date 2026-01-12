import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Member, Profile, Server, Message, MessageReaction, DMMessage, DMMessageReaction } from "@prisma/client";

// Socket.io types для API responses
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Member с Profile
export type MemberWithProfile = Member & {
  profile: Profile;
};

// Server с Members и Profiles
export type ServerWithMembersWithProfiles = Server & {
  members: MemberWithProfile[];
};

// Message с Member, Profile и Reactions
export type MessageWithMemberWithProfile = Message & {
  member: MemberWithProfile;
  reactions: (MessageReaction & {
    member: MemberWithProfile;
  })[];
};

// DM Message с Profile и Reactions
export type DMMessageWithProfile = DMMessage & {
  profile: Profile;
  reactions: (DMMessageReaction & {
    member: MemberWithProfile;
  })[];
};
