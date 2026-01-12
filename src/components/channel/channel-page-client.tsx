"use client";

import { useState } from "react";
import { Channel, ChannelType, Member, Server } from "@prisma/client";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";
import { MusicPanel } from "@/components/music/music-panel";

interface ChannelPageClientProps {
  channel: Channel;
  member: Member;
  server: Server;
  serverId: string;
}

export function ChannelPageClient({ channel, member, server, serverId }: ChannelPageClientProps) {
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const isVoiceChannel = channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO;

  return (
    <div className="bg-chat-area flex h-full">
      <div className="flex flex-col flex-1 h-full">
        <ChatHeader
          name={channel.name}
          serverId={serverId}
          channelId={channel.id}
          type="channel"
          onMusicClick={isVoiceChannel ? () => setShowMusicPanel(!showMusicPanel) : undefined}
        />

        {/* Text channel */}
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

        {/* Voice/Video channel */}
        {isVoiceChannel && (
          <MediaRoom
            chatId={channel.id}
            video={channel.type === ChannelType.VIDEO}
            audio={true}
            channelName={channel.name}
            serverId={serverId}
            serverName={server.name}
            profileName={member.profile?.name || "User"}
          />
        )}
      </div>

      {/* Music Panel */}
      {showMusicPanel && isVoiceChannel && (
        <MusicPanel
          serverId={serverId}
          voiceChannelId={channel.id}
          onClose={() => setShowMusicPanel(false)}
        />
      )}
    </div>
  );
}
