'use client';

import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VoiceChannelProps {
  channelId: string;
  channelName: string;
  type: 'audio' | 'video';
}

export function VoiceChannel({ channelId, channelName, type }: VoiceChannelProps) {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch(
          `/api/livekit?room=${channelId}&username=${encodeURIComponent(channelName)}`
        );

        if (!res.ok) {
          const text = await res.text();
          setError(text === 'LiveKit not configured'
            ? 'LiveKit not configured. Add keys to .env file.'
            : `Error: ${text}`
          );
          return;
        }

        const data = await res.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
        setError('Failed to connect to server');
      }
    }
    getToken();
  }, [channelId, channelName]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-muted-foreground text-sm text-center px-4">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-muted-foreground animate-spin my-4" />
        <p className="text-xs text-muted-foreground">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-chuba-dark rounded-lg overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        data-lk-theme="default"
        className="h-full"
      >
        {type === 'video' ? (
          <VideoConference />
        ) : (
          <AudioConference />
        )}
      </LiveKitRoom>
    </div>
  );
}
