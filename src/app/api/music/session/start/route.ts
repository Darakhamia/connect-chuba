import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { serverId, voiceChannelId } = await req.json();

    if (!serverId || !voiceChannelId) {
      return new NextResponse("Server ID and Voice Channel ID required", { status: 400 });
    }

    // Verify channel exists and is a voice channel
    const channel = await db.channel.findUnique({
      where: { id: voiceChannelId },
    });

    if (!channel || channel.serverId !== serverId) {
      return new NextResponse("Invalid channel", { status: 404 });
    }

    if (channel.type !== ChannelType.AUDIO && channel.type !== ChannelType.VIDEO) {
      return new NextResponse("Channel must be a voice/video channel", { status: 400 });
    }

    // Check if user is a member of the server
    const member = await db.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
      },
    });

    if (!member) {
      return new NextResponse("Not a member of this server", { status: 403 });
    }

    // Check if session already exists for this voice channel
    let session = await db.musicSession.findUnique({
      where: {
        serverId_voiceChannelId: {
          serverId,
          voiceChannelId,
        },
      },
      include: {
        currentTrack: true,
        queue: {
          include: {
            track: true,
            addedBy: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        permissions: true,
      },
    });

    // If session doesn't exist, create it
    if (!session) {
      session = await db.musicSession.create({
        data: {
          serverId,
          voiceChannelId,
          createdById: profile.id,
        },
        include: {
          currentTrack: true,
          queue: {
            include: {
              track: true,
              addedBy: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          permissions: true,
        },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("[MUSIC_SESSION_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
