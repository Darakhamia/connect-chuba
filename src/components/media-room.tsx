"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export function MediaRoom({ chatId, video, audio }: MediaRoomProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

