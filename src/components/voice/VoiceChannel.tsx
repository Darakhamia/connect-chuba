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
  const [serverUrl, setServerUrl] = useState<string>('');
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
            ? 'LiveKit не настроен. Добавьте ключи в .env'
            : `Ошибка: ${text}`
          );
          return;
        }

        const data = await res.json();
        setToken(data.token);
        setServerUrl(data.url);
      } catch (e) {
        console.error('[LiveKit Voice]', e);
        setError('Не удалось подключиться к серверу');
      }
    }
    getToken();
  }, [channelId, channelName]);

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-destructive text-sm text-center px-4">{error}</p>
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
    <div className="h-full bg-background rounded-lg overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        className="h-full"
        onError={(err) => {
          console.error('[LiveKit Voice] Error:', err);
          setError(`Ошибка: ${err.message}`);
        }}
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
