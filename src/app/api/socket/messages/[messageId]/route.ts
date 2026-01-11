import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { messageId } = await params;
    
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Проверяем что пользователь является членом сервера
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Проверяем что канал существует
    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Находим члена сервера
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Находим сообщение
    let message = await db.message.findFirst({
      where: {
        id: messageId,
        channelId: channelId,
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

    // Проверяем права на удаление
    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Soft delete - помечаем как удаленное
    message = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        fileUrl: null,
        content: "Сообщение удалено",
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

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { content } = await req.json();
    const { messageId } = await params;
    
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Проверяем что пользователь является членом сервера
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Проверяем что канал существует
    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Находим члена сервера
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Находим сообщение
    let message = await db.message.findFirst({
      where: {
        id: messageId,
        channelId: channelId,
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

    // Только автор может редактировать
    const isMessageOwner = message.memberId === member.id;

    if (!isMessageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Обновляем сообщение
    message = await db.message.update({
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

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

