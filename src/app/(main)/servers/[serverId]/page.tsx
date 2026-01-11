import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface ServerPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

export default async function ServerPage({ params }: ServerPageProps) {
  const { serverId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Получаем сервер и первый текстовый канал
  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          type: "TEXT",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!server) {
    redirect("/");
  }

  // Редирект на первый текстовый канал (general)
  const initialChannel = server.channels[0];

  if (initialChannel) {
    redirect(`/servers/${serverId}/channels/${initialChannel.id}`);
  }

  return null;
}

