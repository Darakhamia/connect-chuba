import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

export default async function InviteCodePage({ params }: InviteCodePageProps) {
  const profile = await currentProfile();
  const { inviteCode } = await params;

  if (!profile) {
    redirect("/sign-in");
  }

  if (!inviteCode) {
    redirect("/");
  }

  // Проверяем, не состоит ли пользователь уже на этом сервере
  const existingServer = await db.server.findFirst({
    where: {
      inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    redirect(`/servers/${existingServer.id}`);
  }

  // Добавляем пользователя на сервер
  const server = await db.server.update({
    where: {
      inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    redirect(`/servers/${server.id}`);
  }

  return null;
}

