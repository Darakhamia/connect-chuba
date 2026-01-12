import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Search messages in a DM conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { conversationId } = await params;
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!query) {
      return new NextResponse("Query missing", { status: 400 });
    }

    // Find conversation
    const conversation = await db.dMConversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Check if user is part of conversation
    if (
      conversation.profileOneId !== profile.id &&
      conversation.profileTwoId !== profile.id
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Search messages
    const messages = await db.dMMessage.findMany({
      where: {
        conversationId,
        deleted: false,
        content: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Max 50 results
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[DM_MESSAGE_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
