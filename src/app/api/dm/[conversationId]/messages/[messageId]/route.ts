import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { content } = await req.json();
    const { conversationId, messageId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new NextResponse("Content missing", { status: 400 });
    }

    // Находим сообщение
    const message = await db.dMMessage.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
      include: {
        profile: true,
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Проверяем что это автор
    if (message.profileId !== profile.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Обновляем
    const updatedMessage = await db.dMMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("[DM_MESSAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { conversationId, messageId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Находим сообщение
    const message = await db.dMMessage.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
      include: {
        profile: true,
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Проверяем что это автор
    if (message.profileId !== profile.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Soft delete
    const deletedMessage = await db.dMMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content: "Сообщение удалено",
        fileUrl: null,
        deleted: true,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.error("[DM_MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
