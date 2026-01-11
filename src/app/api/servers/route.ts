import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Создаём сервер с дефолтным каналом "general"
    // Используем дефолтную картинку если не указана
    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5865F2&color=fff&size=128`,
        inviteCode: uuidv4(),
        channels: {
          create: [
            { name: "general", profileId: profile.id },
          ],
        },
        members: {
          create: [
            { profileId: profile.id, role: MemberRole.ADMIN },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
