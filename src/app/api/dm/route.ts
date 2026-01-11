import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET - Получить все DM беседы
export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await db.dMConversation.findMany({
      where: {
        OR: [
          { profileOneId: profile.id },
          { profileTwoId: profile.id },
        ],
      },
      include: {
        profileOne: true,
        profileTwo: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Преобразуем - показываем другого участника
    const result = conversations.map((conv) => {
      const otherProfile = conv.profileOneId === profile.id 
        ? conv.profileTwo 
        : conv.profileOne;
      
      return {
        id: conv.id,
        profile: otherProfile,
        lastMessage: conv.messages[0] || null,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[DM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Создать или получить DM беседу
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { profileId } = await req.json();

    if (!profileId) {
      return new NextResponse("Profile ID required", { status: 400 });
    }

    if (profileId === profile.id) {
      return new NextResponse("Cannot message yourself", { status: 400 });
    }

    // Проверяем существует ли уже беседа
    let conversation = await db.dMConversation.findFirst({
      where: {
        OR: [
          { profileOneId: profile.id, profileTwoId: profileId },
          { profileOneId: profileId, profileTwoId: profile.id },
        ],
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });

    // Если нет - создаём
    if (!conversation) {
      conversation = await db.dMConversation.create({
        data: {
          profileOneId: profile.id,
          profileTwoId: profileId,
        },
        include: {
          profileOne: true,
          profileTwo: true,
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[DM_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
