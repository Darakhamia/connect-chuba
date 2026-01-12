import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { emoji } = await req.json();
    const { channelId, messageId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoji) {
      return new NextResponse("Emoji missing", { status: 400 });
    }

    // Находим сообщение
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        channelId,
      },
      include: {
        member: {
          include: {
            server: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Находим текущего member на сервере
    const currentMember = await db.member.findFirst({
      where: {
        serverId: message.member.serverId,
        profileId: profile.id,
      },
    });

    if (!currentMember) {
      return new NextResponse("Not a member", { status: 403 });
    }

    // Проверяем существует ли уже реакция
    const existingReaction = await db.messageReaction.findUnique({
      where: {
        messageId_memberId_emoji: {
          messageId,
          memberId: currentMember.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Удаляем реакцию (toggle)
      await db.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      
      return NextResponse.json({ action: "removed" });
    } else {
      // Добавляем реакцию
      const reaction = await db.messageReaction.create({
        data: {
          emoji,
          messageId,
          memberId: currentMember.id,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      return NextResponse.json({ action: "added", reaction });
    }
  } catch (error) {
    console.error("[MESSAGE_REACTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
