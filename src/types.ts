import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Member, Profile, Server, Message } from "@prisma/client";

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

// Message с Member и Profile
export type MessageWithMemberWithProfile = Message & {
  member: MemberWithProfile;
};
