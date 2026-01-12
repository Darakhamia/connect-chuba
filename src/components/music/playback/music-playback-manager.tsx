"use client";

import { useEffect, useRef, useState } from "react";
import { YouTubePlayer, YT_STATE, createYouTubeController } from "./youtube-player";
import { AppleMusicPlayer, createAppleMusicController } from "./apple-music-player";
import { SoundCloudPlayer, createSoundCloudController } from "./soundcloud-player";
import { TrackSource } from "@prisma/client";

interface Track {
  id: string;
  source: TrackSource;
  sourceId: string;
  title: string;
  durationMs: number;
  uploadedFileUrl?: string;
  originalUrl?: string;
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
  const appleMusicRef = useRef<any>(null);
  const soundCloudRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Controllers
  const youtubeController = createYouTubeController(youtubePlayerRef);
  const appleMusicController = createAppleMusicController(appleMusicRef);
  const soundCloudController = createSoundCloudController(soundCloudRef);

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

    switch (currentTrack?.source) {
      case TrackSource.YOUTUBE:
        youtubeController.setVolume(volume);
        break;
      case TrackSource.APPLE_MUSIC:
        appleMusicController.setVolume(volume);
        break;
      case TrackSource.SOUNDCLOUD:
        soundCloudController.setVolume(volume);
        break;
      case TrackSource.UPLOADED:
        if (audioRef.current) {
          audioRef.current.volume = volume / 100;
        }
        break;
    }
  }, [volume, isReady, currentTrack?.source]);

  const startPlayback = () => {
    if (!currentTrack) return;

    const targetPositionMs = calculateCurrentPosition();
    const targetSeconds = targetPositionMs / 1000;

    switch (currentTrack.source) {
      case TrackSource.YOUTUBE:
        youtubeController.seekTo(targetSeconds);
        youtubeController.play();
        break;
      case TrackSource.APPLE_MUSIC:
        appleMusicController.seekTo(targetSeconds);
        appleMusicController.play();
        break;
      case TrackSource.SOUNDCLOUD:
        soundCloudController.seekTo(targetSeconds);
        soundCloudController.play();
        break;
      case TrackSource.UPLOADED:
        if (audioRef.current) {
          audioRef.current.currentTime = targetSeconds;
          audioRef.current.play().catch(console.error);
        }
        break;
    }
  };

  const pausePlayback = () => {
    if (!currentTrack) return;

    switch (currentTrack.source) {
      case TrackSource.YOUTUBE:
        youtubeController.pause();
        break;
      case TrackSource.APPLE_MUSIC:
        appleMusicController.pause();
        break;
      case TrackSource.SOUNDCLOUD:
        soundCloudController.pause();
        break;
      case TrackSource.UPLOADED:
        if (audioRef.current) {
          audioRef.current.pause();
        }
        break;
    }
  };

  const syncPlayback = () => {
    if (!currentTrack || !startedAt) return;

    const expectedPositionMs = calculateCurrentPosition();
    const expectedSeconds = expectedPositionMs / 1000;

    let currentSeconds = 0;

    switch (currentTrack.source) {
      case TrackSource.YOUTUBE:
        currentSeconds = youtubeController.getCurrentTime();
        break;
      case TrackSource.APPLE_MUSIC:
        currentSeconds = appleMusicController.getCurrentTime();
        break;
      case TrackSource.SOUNDCLOUD:
        soundCloudController.getCurrentTime((time) => {
          currentSeconds = time;
        });
        break;
      case TrackSource.UPLOADED:
        if (audioRef.current) {
          currentSeconds = audioRef.current.currentTime;
        }
        break;
    }

    const driftMs = Math.abs((currentSeconds * 1000) - expectedPositionMs);

    console.log("Sync check - Expected:", expectedSeconds, "Current:", currentSeconds, "Drift:", driftMs);

    // If drift > 500ms, resync
    if (driftMs > 500) {
      console.log("Drift detected, resyncing...");
      switch (currentTrack.source) {
        case TrackSource.YOUTUBE:
          youtubeController.seekTo(expectedSeconds);
          break;
        case TrackSource.APPLE_MUSIC:
          appleMusicController.seekTo(expectedSeconds);
          break;
        case TrackSource.SOUNDCLOUD:
          soundCloudController.seekTo(expectedSeconds);
          break;
        case TrackSource.UPLOADED:
          if (audioRef.current) {
            audioRef.current.currentTime = expectedSeconds;
          }
          break;
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

  const handleAppleMusicReady = () => {
    console.log("Apple Music ready");
    setIsReady(true);
    appleMusicController.setVolume(volume);
  };

  const handleAppleMusicStateChange = (state: "playing" | "paused" | "stopped" | "ended") => {
    if (state === "ended") {
      console.log("Apple Music track ended");
      onEnded?.();
    }
  };

  const handleSoundCloudReady = () => {
    console.log("SoundCloud ready");
    setIsReady(true);
    soundCloudController.setVolume(volume);
  };

  const handleSoundCloudStateChange = (state: "playing" | "paused" | "stopped" | "ended") => {
    if (state === "ended") {
      console.log("SoundCloud track ended");
      onEnded?.();
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

      {/* Apple Music Player */}
      {currentTrack?.source === TrackSource.APPLE_MUSIC && (
        <AppleMusicPlayer
          trackId={currentTrack.sourceId}
          onReady={handleAppleMusicReady}
          onStateChange={handleAppleMusicStateChange}
          onError={(error) => console.error("Apple Music error:", error)}
        />
      )}

      {/* SoundCloud Player */}
      {currentTrack?.source === TrackSource.SOUNDCLOUD && currentTrack.originalUrl && (
        <SoundCloudPlayer
          url={currentTrack.originalUrl}
          onReady={handleSoundCloudReady}
          onStateChange={handleSoundCloudStateChange}
          onError={(error) => console.error("SoundCloud error:", error)}
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

      {/* Spotify - requires user OAuth (not implemented yet) */}
      {currentTrack?.source === TrackSource.SPOTIFY && (
        <div className="p-4 text-center text-muted-foreground">
          <p>Spotify playback requires Premium account and authentication</p>
          <p className="text-sm mt-2">(Coming soon)</p>
        </div>
      )}
    </>
  );
}
