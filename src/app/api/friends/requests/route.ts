import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET - Получить входящие/исходящие запросы в друзья
export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "incoming"; // incoming | outgoing

    if (type === "incoming") {
      const requests = await db.friendRequest.findMany({
        where: {
          receiverId: profile.id,
          status: "PENDING",
        },
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(requests);
    } else {
      const requests = await db.friendRequest.findMany({
        where: {
          senderId: profile.id,
          status: "PENDING",
        },
        include: {
          receiver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error("[FRIEND_REQUESTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Отправить запрос в друзья
export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { oderId } = await req.json();
    const searchId = oderId;

    if (!searchId) {
      return new NextResponse("User ID required", { status: 400 });
    }

    // Находим пользователя по id или oderId
    const targetProfile = await db.profile.findFirst({
      where: {
        OR: [
          { id: searchId },
          { oderId: searchId },
        ],
      },
    });

    if (!targetProfile) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetProfile.id === profile.id) {
      return new NextResponse("Cannot add yourself", { status: 400 });
    }

    // Проверяем, не друзья ли уже
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { profileOneId: profile.id, profileTwoId: targetProfile.id },
          { profileOneId: targetProfile.id, profileTwoId: profile.id },
        ],
      },
    });

    if (existingFriendship) {
      return new NextResponse("Already friends", { status: 400 });
    }

    // Проверяем, нет ли уже запроса
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: profile.id, receiverId: targetProfile.id },
          { senderId: targetProfile.id, receiverId: profile.id },
        ],
        status: "PENDING",
      },
    });

    if (existingRequest) {
      // Если запрос от другого пользователя - принимаем его
      if (existingRequest.senderId === targetProfile.id) {
        // Принимаем запрос и создаём дружбу
        await db.friendRequest.update({
          where: { id: existingRequest.id },
          data: { status: "ACCEPTED" },
        });

        const friendship = await db.friendship.create({
          data: {
            profileOneId: profile.id,
            profileTwoId: targetProfile.id,
          },
        });

        return NextResponse.json({ friendship, message: "Friend request accepted" });
      }

      return new NextResponse("Request already sent", { status: 400 });
    }

    // Создаём новый запрос
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId: profile.id,
        receiverId: targetProfile.id,
      },
      include: {
        receiver: true,
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("[FRIEND_REQUESTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
