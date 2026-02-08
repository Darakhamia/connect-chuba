"use client";

import { useCallback, useEffect, useState } from "react";
import { Channel, ChannelType, Member, Profile, Server } from "@prisma/client";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";
import { MusicPanel } from "@/components/music/music-panel";
import { Headphones, Video, LogIn } from "lucide-react";

type MemberWithProfile = Member & { profile: Profile };

interface VoiceParticipant {
  identity: string;
  name: string;
  avatarUrl: string;
}

interface ChannelPageClientProps {
  channel: Channel;
  member: MemberWithProfile;
  server: Server;
  serverId: string;
}

function VoiceLobby({
  channelName,
  channelId,
  isVideo,
  onJoin,
}: {
  channelName: string;
  channelId: string;
  isVideo: boolean;
  onJoin: () => void;
}) {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch(`/api/livekit/participants?room=${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch {}
  }, [channelId]);

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {isVideo ? (
            <Video className="w-8 h-8 text-primary" />
          ) : (
            <Headphones className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{channelName}</h2>
        <p className="text-sm text-muted-foreground">
          {isVideo ? "Видео канал" : "Голосовой канал"}
        </p>
      </div>

      {participants.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Сейчас в канале — {participants.length}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {participants.map((p) => (
              <div key={p.identity} className="flex flex-col items-center gap-1.5">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-foreground">
                    {p.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {participants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Никого нет в канале. Будьте первым!
        </p>
      )}

      <button
        onClick={onJoin}
        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors text-base"
      >
        <LogIn className="w-5 h-5" />
        Присоединиться
      </button>
    </div>
  );
}

export function ChannelPageClient({ channel, member, server, serverId }: ChannelPageClientProps) {
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [joined, setJoined] = useState(false);
  const isVoiceChannel = channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO;

  return (
    <div className="bg-chat-area flex h-full">
      <div className="flex flex-col flex-1 h-full">
        <ChatHeader
          name={channel.name}
          serverId={serverId}
          channelId={channel.id}
          type="channel"
          onMusicClick={isVoiceChannel && joined ? () => setShowMusicPanel(!showMusicPanel) : undefined}
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

        {/* Voice/Video channel — Lobby */}
        {isVoiceChannel && !joined && (
          <VoiceLobby
            channelName={channel.name}
            channelId={channel.id}
            isVideo={channel.type === ChannelType.VIDEO}
            onJoin={() => setJoined(true)}
          />
        )}

        {/* Voice/Video channel — Connected */}
        {isVoiceChannel && joined && (
          <MediaRoom
            chatId={channel.id}
            video={channel.type === ChannelType.VIDEO}
            audio={true}
            channelName={channel.name}
            serverId={serverId}
            serverName={server.name}
            username={member.profile.name}
            imageUrl={member.profile.imageUrl}
          />
        )}
      </div>

      {/* Music Panel */}
      {showMusicPanel && isVoiceChannel && joined && (
        <MusicPanel
          serverId={serverId}
          voiceChannelId={channel.id}
          onClose={() => setShowMusicPanel(false)}
        />
      )}
    </div>
  );
}
