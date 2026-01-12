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
    const { content } = await req.json();
    const { channelId, messageId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new NextResponse("Content missing", { status: 400 });
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
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Проверяем что это автор сообщения
    const isOwner = message.member.profileId === profile.id;

    if (!isOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Обновляем сообщение
    const updatedMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        content,
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
    console.error("[MESSAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
            profile: true,
            server: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Проверяем права
    const isOwner = message.member.profileId === profile.id;
    const isAdmin = message.member.role === MemberRole.ADMIN;
    const isModerator = message.member.role === MemberRole.MODERATOR;

    // Текущий member на сервере
    const currentMember = await db.member.findFirst({
      where: {
        serverId: message.member.serverId,
        profileId: profile.id,
      },
    });

    const canDelete = isOwner || 
      currentMember?.role === MemberRole.ADMIN ||
      currentMember?.role === MemberRole.MODERATOR;

    if (!canDelete) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Soft delete - помечаем как удалённое
    const deletedMessage = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        content: "Сообщение удалено",
        fileUrl: null,
        deleted: true,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
