import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET pinned messages for a channel
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { channelId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find channel
    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        server: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Check if user is a member
    const isMember = channel.server.members.some(
      (member) => member.profileId === profile.id
    );

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get pinned messages
    const pinnedMessages = await db.message.findMany({
      where: {
        channelId,
        pinned: true,
        deleted: false,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        reactions: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Max 50 pinned messages
    });

    return NextResponse.json(pinnedMessages);
  } catch (error) {
    console.error("[PINNED_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
