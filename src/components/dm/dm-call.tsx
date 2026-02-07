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
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=dm-${conversationId}&username=${encodeURIComponent(profileName)}`
        );

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Failed to get token");
        }

        const data = await resp.json();
        setToken(data.token);
        setServerUrl(data.url);
      } catch (e: unknown) {
        console.error("[LiveKit DM] Error:", e);
        setError(e instanceof Error ? e.message : "Не удалось подключиться");
      }
    })();
  }, [conversationId, profileName]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-2">Ошибка подключения</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={serverUrl}
        token={token}
        connect={true}
        video={isVideo}
        audio={true}
        onDisconnected={onDisconnect}
        onError={(err) => {
          console.error("[LiveKit DM] Connection error:", err);
          setError(`Ошибка: ${err.message}`);
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
