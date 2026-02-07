"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/use-voice-store";

interface MediaRoomProps {
  chatId: string;
  channelName: string;
  serverId: string;
  serverName: string;
  username: string;
  video: boolean;
  audio: boolean;
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

  // Присоединяемся к голосовому каналу при монтировании
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
        console.log("[LiveKit] Fetching token for room:", chatId, "user:", username);

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
        console.log("[LiveKit] Token obtained, server URL:", data.url);
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
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
