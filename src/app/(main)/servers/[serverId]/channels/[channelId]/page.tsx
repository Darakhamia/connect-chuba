import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelPageClient } from "@/components/channel/channel-page-client";

interface ChannelPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { serverId, channelId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Получаем канал и сервер
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
  });

  // Получаем участника с profile
  const member = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!channel || !member || !server) {
    redirect("/");
  }

  return (
    <ChannelPageClient
      channel={channel}
      member={member}
      server={server}
      serverId={serverId}
    />
  );
}
