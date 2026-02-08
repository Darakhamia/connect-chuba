"use client";

import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ControlBar,
  RoomAudioRenderer,
  useTracks,
  useParticipantContext,
  TrackRefContext,
  ParticipantContextIfNeeded,
  VideoTrack,
  ConnectionStateToast,
  isTrackReference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/use-voice-store";

interface MediaRoomProps {
  chatId: string;
  channelName: string;
  serverId: string;
  serverName: string;
  username: string;
  imageUrl?: string;
  video: boolean;
  audio: boolean;
}

function ParticipantAvatar() {
  const participant = useParticipantContext();
  let avatarUrl = "";
  try {
    const meta = JSON.parse(participant.metadata || "{}");
    avatarUrl = meta.avatarUrl || "";
  } catch {}

  const initial = participant.identity?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={participant.identity}
          className="w-24 h-24 rounded-full object-cover"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white/70">
          {initial}
        </div>
      )}
    </div>
  );
}

function CustomParticipantTile() {
  const trackRef = React.useContext(TrackRefContext);
  const participant = trackRef?.participant;
  const hasVideo = trackRef && isTrackReference(trackRef)
    && trackRef.publication?.track && !trackRef.publication.isMuted;

  return (
    <div className="lk-participant-tile">
      {hasVideo ? (
        <VideoTrack trackRef={trackRef} />
      ) : (
        <ParticipantContextIfNeeded participant={participant}>
          <ParticipantAvatar />
        </ParticipantContextIfNeeded>
      )}
      <div className="lk-participant-metadata">
        <div className="lk-participant-metadata-item">
          <span className="lk-participant-name">
            {participant?.identity}
          </span>
        </div>
      </div>
    </div>
  );
}

function VoiceLayout({ video }: { video: boolean }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <GridLayout tracks={tracks}>
          <CustomParticipantTile />
        </GridLayout>
      </div>
      <ControlBar
        controls={{ chat: false, screenShare: video }}
        variation="verbose"
      />
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

export function MediaRoom({
  chatId,
  channelName,
  serverId,
  serverName,
  username,
  video,
  audio
}: MediaRoomProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { joinVoice, leaveVoice, activeChannelId } = useVoice();

  useEffect(() => {
    if (activeChannelId !== chatId) {
      joinVoice({
        channelId: chatId,
        channelName,
        serverId,
        serverName,
        isVideo: video,
      });
    }
  }, [chatId, channelName, serverId, serverName, video, joinVoice, activeChannelId]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${encodeURIComponent(username)}`
        );

        if (!resp.ok) {
          const text = await resp.text();
          if (text === "LiveKit not configured") {
            setError("LiveKit не настроен. Добавьте LIVEKIT_API_KEY и LIVEKIT_API_SECRET в .env");
          } else {
            setError(`Ошибка: ${text}`);
          }
          return;
        }

        const data = await resp.json();
        setToken(data.token);
        setServerUrl(data.url);
      } catch (e) {
        console.error("[LiveKit] Token fetch error:", e);
        setError("Не удалось получить токен LiveKit");
      }
    })();
  }, [chatId, username]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-destructive text-sm text-center px-4">
          {error}
        </p>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-muted-foreground animate-spin my-4" />
        <p className="text-xs text-muted-foreground">Подключение...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={video}
      audio={audio}
      onDisconnected={() => leaveVoice()}
      onError={(err) => {
        console.error("[LiveKit] Connection error:", err);
        setError(`Ошибка подключения: ${err.message}`);
      }}
      style={{ height: "100%" }}
    >
      <VoiceLayout video={video} />
    </LiveKitRoom>
  );
}
