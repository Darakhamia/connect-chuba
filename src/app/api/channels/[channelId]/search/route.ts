import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Search messages in a channel
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { channelId } = await params;
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!query) {
      return new NextResponse("Query missing", { status: 400 });
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

    // Search messages
    const messages = await db.message.findMany({
      where: {
        channelId,
        deleted: false,
        content: {
          contains: query,
          mode: "insensitive",
        },
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
      take: 50, // Max 50 results
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGE_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
