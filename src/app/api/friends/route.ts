import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// GET - Получить список друзей
export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Получаем все дружбы где текущий пользователь участвует
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { profileOneId: profile.id },
          { profileTwoId: profile.id },
        ],
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });

    // Преобразуем в список друзей
    const friends = friendships.map((friendship) => {
      const friend = friendship.profileOneId === profile.id
        ? friendship.profileTwo
        : friendship.profileOne;
      return {
        id: friendship.id,
        friendshipId: friendship.id,
        ...friend,
      };
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error("[FRIENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
