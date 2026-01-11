import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// PATCH - Принять или отклонить запрос
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { requestId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { action } = await req.json(); // "accept" | "decline"

    if (!["accept", "decline"].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 });
    }

    // Находим запрос
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!friendRequest) {
      return new NextResponse("Request not found", { status: 404 });
    }

    // Проверяем что текущий пользователь - получатель
    if (friendRequest.receiverId !== profile.id) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    if (action === "accept") {
      // Обновляем статус запроса
      await db.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Создаём дружбу
      const friendship = await db.friendship.create({
        data: {
          profileOneId: friendRequest.senderId,
          profileTwoId: friendRequest.receiverId,
        },
        include: {
          profileOne: true,
          profileTwo: true,
        },
      });

      return NextResponse.json({ friendship, message: "Friend request accepted" });
    } else {
      // Отклоняем запрос
      await db.friendRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED" },
      });

      return NextResponse.json({ message: "Friend request declined" });
    }
  } catch (error) {
    console.error("[FRIEND_REQUEST_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Отменить исходящий запрос
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { requestId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Находим запрос
    const friendRequest = await db.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return new NextResponse("Request not found", { status: 404 });
    }

    // Проверяем что текущий пользователь - отправитель
    if (friendRequest.senderId !== profile.id) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    await db.friendRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: "Request cancelled" });
  } catch (error) {
    console.error("[FRIEND_REQUEST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
