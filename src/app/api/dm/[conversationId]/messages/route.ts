import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET - Получить сообщения беседы
export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { conversationId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Проверяем что беседа существует и пользователь участник
    const conversation = await db.dMConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    if (conversation.profileOneId !== profile.id && conversation.profileTwoId !== profile.id) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    // Получаем сообщения
    const messages = await db.dMMessage.findMany({
      where: {
        conversationId,
        deleted: false,
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[DM_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Отправить сообщение
export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { conversationId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content required", { status: 400 });
    }

    // Проверяем что беседа существует и пользователь участник
    const conversation = await db.dMConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    if (conversation.profileOneId !== profile.id && conversation.profileTwoId !== profile.id) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    // Создаём сообщение
    const message = await db.dMMessage.create({
      data: {
        content,
        profileId: profile.id,
        conversationId,
      },
      include: {
        profile: true,
      },
    });

    // Обновляем время беседы
    await db.dMConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[DM_MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
