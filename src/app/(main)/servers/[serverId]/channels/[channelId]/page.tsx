import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

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

  // Получаем канал
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  // Получаем участника
  const member = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-chat-area flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={serverId}
        type="channel"
      />
      
      {/* Текстовый канал */}
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
            chatId={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId,
            }}
          />
        </>
      )}
      
      {/* Голосовой канал */}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom
          chatId={channel.id}
          video={false}
          audio={true}
        />
      )}
      
      {/* Видео канал */}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom
          chatId={channel.id}
          video={true}
          audio={true}
        />
      )}
    </div>
  );
}
