"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";

interface DMCallProps {
  conversationId: string;
  profileName: string;
  otherProfileName: string;
  isVideo: boolean;
  onDisconnect: () => void;
}

export function DMCall({
  conversationId,
  profileName,
  otherProfileName,
  isVideo,
  onDisconnect,
}: DMCallProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=dm-${conversationId}&username=${profileName}`
        );

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Failed to get token");
        }

        const data = await resp.json();
        setToken(data.token);
      } catch (e: unknown) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Не удалось подключиться");
      }
    })();
  }, [conversationId, profileName]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <p className="text-red-500 mb-2">Ошибка подключения</p>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-900">
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
        video={isVideo}
        audio={true}
        onDisconnected={onDisconnect}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
