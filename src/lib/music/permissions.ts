import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function canControlMusic(
  sessionId: string,
  profileId: string,
  serverId: string
): Promise<boolean> {
  // Get session
  const session = await db.musicSession.findUnique({
    where: { id: sessionId },
    include: {
      permissions: true,
    },
  });

  if (!session) {
    return false;
  }

  // Creator can always control
  if (session.createdById === profileId) {
    return true;
  }

  // Check if DJ mode is enabled
  if (session.djMode) {
    // Only users with explicit permission can control
    const permission = session.permissions.find((p) => p.profileId === profileId);
    return permission?.canControl || false;
  }

  // If not DJ mode, check server roles
  const member = await db.member.findFirst({
    where: {
      serverId,
      profileId,
    },
  });

  if (!member) {
    return false;
  }

  // Admins and moderators can control
  return member.role === MemberRole.ADMIN || member.role === MemberRole.MODERATOR;
}

export async function isInVoiceChannel(
  voiceChannelId: string,
  profileId: string
): Promise<boolean> {
  // In a real implementation, you would check active voice connections
  // For now, we'll assume if they're a member of the server, they can be in the VC
  const channel = await db.channel.findUnique({
    where: { id: voiceChannelId },
    include: {
      server: {
        include: {
          members: {
            where: {
              profileId,
            },
          },
        },
      },
    },
  });

  return !!channel && channel.server.members.length > 0;
}
