import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { channelId, messageId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // Текущий member на сервере
    const currentMember = await db.member.findFirst({
      where: {
        serverId: message.member.serverId,
        profileId: profile.id,
      },
    });

    // Только модераторы и админы могут прикреплять
    const canPin =
      currentMember?.role === MemberRole.ADMIN ||
      currentMember?.role === MemberRole.MODERATOR;

    if (!canPin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Toggle pin
    const updatedMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        pinned: !message.pinned,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("[MESSAGE_PIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
