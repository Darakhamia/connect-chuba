"use client";

import { useEffect, useRef, useState } from "react";
import { YouTubePlayer, YT_STATE, createYouTubeController } from "./youtube-player";
import { TrackSource } from "@prisma/client";

interface Track {
  id: string;
  source: TrackSource;
  sourceId: string;
  title: string;
  durationMs: number;
  uploadedFileUrl?: string;
}

interface MusicPlaybackManagerProps {
  sessionId: string;
  currentTrack: Track | null;
  state: "IDLE" | "PLAYING" | "PAUSED" | "LOADING";
  startedAt: Date | null;
  offsetMs: number;
  volume: number;
  onEnded?: () => void;
}

export function MusicPlaybackManager({
  sessionId,
  currentTrack,
  state,
  startedAt,
  offsetMs,
  volume,
  onEnded,
}: MusicPlaybackManagerProps) {
  const youtubePlayerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube controller
  const youtubeController = createYouTubeController(youtubePlayerRef);

  // Initialize playback when track changes
  useEffect(() => {
    if (!currentTrack) {
      setIsReady(false);
      return;
    }

    console.log("Track changed:", currentTrack);
    setIsReady(false);
  }, [currentTrack?.id]);

  // Handle playback state changes
  useEffect(() => {
    if (!isReady || !currentTrack) return;

    if (state === "PLAYING") {
      startPlayback();
    } else if (state === "PAUSED") {
      pausePlayback();
    }
  }, [state, isReady]);

  // Sync playback position periodically
  useEffect(() => {
    if (state === "PLAYING" && isReady) {
      syncIntervalRef.current = setInterval(() => {
        syncPlayback();
      }, 5000); // Sync every 5 seconds
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [state, isReady, startedAt, offsetMs]);

  // Update volume
  useEffect(() => {
    if (!isReady) return;

    if (currentTrack?.source === TrackSource.YOUTUBE) {
      youtubeController.setVolume(volume);
    } else if (currentTrack?.source === TrackSource.UPLOADED && audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isReady, currentTrack?.source]);

  const startPlayback = () => {
    if (!currentTrack) return;

    const targetPositionMs = calculateCurrentPosition();
    const targetSeconds = targetPositionMs / 1000;

    if (currentTrack.source === TrackSource.YOUTUBE) {
      youtubeController.seekTo(targetSeconds);
      youtubeController.play();
    } else if (currentTrack.source === TrackSource.UPLOADED && audioRef.current) {
      audioRef.current.currentTime = targetSeconds;
      audioRef.current.play().catch(console.error);
    }
  };

  const pausePlayback = () => {
    if (!currentTrack) return;

    if (currentTrack.source === TrackSource.YOUTUBE) {
      youtubeController.pause();
    } else if (currentTrack.source === TrackSource.UPLOADED && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const syncPlayback = () => {
    if (!currentTrack || !startedAt) return;

    const expectedPositionMs = calculateCurrentPosition();
    const expectedSeconds = expectedPositionMs / 1000;

    let currentSeconds = 0;

    if (currentTrack.source === TrackSource.YOUTUBE) {
      currentSeconds = youtubeController.getCurrentTime();
    } else if (currentTrack.source === TrackSource.UPLOADED && audioRef.current) {
      currentSeconds = audioRef.current.currentTime;
    }

    const driftMs = Math.abs((currentSeconds * 1000) - expectedPositionMs);

    console.log("Sync check - Expected:", expectedSeconds, "Current:", currentSeconds, "Drift:", driftMs);

    // If drift > 500ms, resync
    if (driftMs > 500) {
      console.log("Drift detected, resyncing...");
      if (currentTrack.source === TrackSource.YOUTUBE) {
        youtubeController.seekTo(expectedSeconds);
      } else if (currentTrack.source === TrackSource.UPLOADED && audioRef.current) {
        audioRef.current.currentTime = expectedSeconds;
      }
    }
  };

  const calculateCurrentPosition = (): number => {
    if (!startedAt) return offsetMs;
    const elapsed = Date.now() - new Date(startedAt).getTime();
    return offsetMs + elapsed;
  };

  const handleYouTubeReady = () => {
    console.log("YouTube ready");
    setIsReady(true);
    youtubeController.setVolume(volume);
  };

  const handleYouTubeStateChange = (ytState: number) => {
    if (ytState === YT_STATE.ENDED) {
      console.log("YouTube track ended");
      onEnded?.();
    }
  };

  const handleAudioEnded = () => {
    console.log("Audio track ended");
    onEnded?.();
  };

  const handleAudioReady = () => {
    console.log("Audio ready");
    setIsReady(true);
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  return (
    <>
      {/* YouTube Player */}
      {currentTrack?.source === TrackSource.YOUTUBE && (
        <YouTubePlayer
          videoId={currentTrack.sourceId}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          onError={(error) => console.error("YouTube error:", error)}
        />
      )}

      {/* HTML5 Audio Player for uploaded files */}
      {currentTrack?.source === TrackSource.UPLOADED && currentTrack.uploadedFileUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.uploadedFileUrl}
          onLoadedMetadata={handleAudioReady}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Spotify/Apple Music players would go here */}
      {(currentTrack?.source === TrackSource.SPOTIFY || currentTrack?.source === TrackSource.APPLE_MUSIC) && (
        <div className="hidden">
          {/* For MVP, show message that these require user auth */}
          <p>Spotify/Apple Music playback requires authentication (coming soon)</p>
        </div>
      )}
    </>
  );
}
