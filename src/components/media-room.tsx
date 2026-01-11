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
  video: boolean;
  audio: boolean;
}

export function MediaRoom({ 
  chatId, 
  channelName,
  serverId,
  serverName,
  video, 
  audio 
}: MediaRoomProps) {
  const [token, setToken] = useState("");
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

    // При размонтировании НЕ выходим автоматически
    // Выход только по кнопке Leave
  }, [chatId, channelName, serverId, serverName, video, joinVoice, activeChannelId]);

  useEffect(() => {
    const name = `Пользователь_${Math.random().toString(36).slice(2, 7)}`;

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );
        
        if (!resp.ok) {
          const text = await resp.text();
          if (text === "LiveKit not configured") {
            setError("LiveKit не настроен. Добавьте ключи в .env файл.");
          } else {
            setError(`Ошибка: ${text}`);
          }
          return;
        }

        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
        setError("Не удалось подключиться к серверу");
      }
    })();
  }, [chatId]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-muted-foreground text-sm text-center px-4">
          {error}
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          Для голосовых/видео каналов нужны ключи LiveKit
        </p>
      </div>
    );
  }

  if (token === "") {
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
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
      onDisconnected={() => leaveVoice()}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
