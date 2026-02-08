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
import { Track, RoomOptions, ScreenSharePresets, VideoPresets } from "livekit-client";
import { Loader2 } from "lucide-react";

interface DMCallProps {
  conversationId: string;
  profileName: string;
  otherProfileName: string;
  isVideo: boolean;
  onDisconnect: () => void;
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

function DMVoiceLayout({ isVideo }: { isVideo: boolean }) {
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
        controls={{ chat: false, screenShare: true }}
        variation="verbose"
      />
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

export function DMCall({
  conversationId,
  profileName,
  isVideo,
  onDisconnect,
}: DMCallProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const roomOptions: RoomOptions = {
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    publishDefaults: {
      screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
      screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],
    },
  };

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
        options={roomOptions}
        onDisconnected={onDisconnect}
        onError={(err) => {
          console.error("[LiveKit DM] Connection error:", err);
          setError(`Ошибка: ${err.message}`);
        }}
        style={{ height: "100%" }}
      >
        <DMVoiceLayout isVideo={isVideo} />
      </LiveKitRoom>
    </div>
  );
}
