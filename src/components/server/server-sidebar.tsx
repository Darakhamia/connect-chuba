import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerHeader } from "./server-header";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}

export async function ServerSidebar({ serverId }: ServerSidebarProps) {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Получаем сервер со всеми каналами и участниками
  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) {
    redirect("/");
  }

  // Фильтруем каналы по типу
  const textChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  // Фильтруем участников (исключаем текущего пользователя)
  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  // Определяем роль текущего пользователя
  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-full w-full bg-channel-sidebar">
      <ServerHeader server={server} role={role} />
      
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          {/* Текстовые каналы */}
          {!!textChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.TEXT}
                role={role}
                label="Текстовые каналы"
              />
              <div className="space-y-[2px]">
                {textChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                    role={role}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Голосовые каналы */}
          {!!audioChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.AUDIO}
                role={role}
                label="Голосовые каналы"
              />
              <div className="space-y-[2px]">
                {audioChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                    role={role}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Видео каналы */}
          {!!videoChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.VIDEO}
                role={role}
                label="Видео каналы"
              />
              <div className="space-y-[2px]">
                {videoChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                    role={role}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Участники */}
          {!!members?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="members"
                role={role}
                label="Участники"
                server={server}
              />
              <div className="space-y-[2px]">
                {members.map((member) => (
                  <ServerMember
                    key={member.id}
                    member={member}
                    server={server}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

