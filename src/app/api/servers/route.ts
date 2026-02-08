import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";

const templateChannels: Record<string, { name: string; type: ChannelType }[]> = {
  gaming: [
    { name: "general", type: ChannelType.TEXT },
    { name: "скриншоты", type: ChannelType.TEXT },
    { name: "поиск-тиммейтов", type: ChannelType.TEXT },
    { name: "Голосовой", type: ChannelType.AUDIO },
    { name: "Игровой", type: ChannelType.AUDIO },
  ],
  study: [
    { name: "general", type: ChannelType.TEXT },
    { name: "домашка", type: ChannelType.TEXT },
    { name: "ресурсы", type: ChannelType.TEXT },
    { name: "Голосовой", type: ChannelType.AUDIO },
  ],
  friends: [
    { name: "general", type: ChannelType.TEXT },
    { name: "мемы", type: ChannelType.TEXT },
    { name: "Голосовой", type: ChannelType.AUDIO },
  ],
  music: [
    { name: "general", type: ChannelType.TEXT },
    { name: "рекомендации", type: ChannelType.TEXT },
    { name: "плейлисты", type: ChannelType.TEXT },
    { name: "Музыка", type: ChannelType.AUDIO },
  ],
  dev: [
    { name: "general", type: ChannelType.TEXT },
    { name: "код-ревью", type: ChannelType.TEXT },
    { name: "баги", type: ChannelType.TEXT },
    { name: "Голосовой", type: ChannelType.AUDIO },
  ],
};

export async function POST(req: Request) {
  try {
    const { name, imageUrl, description, template } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const channels = templateChannels[template] || [
      { name: "general", type: ChannelType.TEXT },
      { name: "Голосовой", type: ChannelType.AUDIO },
    ];

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5865F2&color=fff&size=128`,
        description: description || null,
        inviteCode: uuidv4(),
        channels: {
          create: channels.map((ch) => ({
            name: ch.name,
            type: ch.type,
            profileId: profile.id,
          })),
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
