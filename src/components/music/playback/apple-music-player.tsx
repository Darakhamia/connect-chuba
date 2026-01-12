"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    MusicKit: any;
  }
}

interface AppleMusicPlayerProps {
  trackId: string;
  onReady?: () => void;
  onStateChange?: (state: "playing" | "paused" | "stopped" | "ended") => void;
  onError?: (error: any) => void;
}

export function AppleMusicPlayer({
  trackId,
  onReady,
  onStateChange,
  onError,
}: AppleMusicPlayerProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const musicKitRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  // Load MusicKit script
  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // Configure MusicKit
  useEffect(() => {
    if (!isScriptLoaded || isConfigured) return;

    const configureMusicKit = async () => {
      try {
        // Note: Developer token should be generated server-side for security
        // This is a simplified version for MVP
        await window.MusicKit.configure({
          developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN || "",
          app: {
            name: "ECHO",
            build: "1.0.0",
          },
        });

        musicKitRef.current = window.MusicKit.getInstance();
        playerRef.current = musicKitRef.current;
        
        setIsConfigured(true);
        onReady?.();

        // Add event listeners
        musicKitRef.current.addEventListener("playbackStateDidChange", handleStateChange);
        musicKitRef.current.addEventListener("mediaItemDidChange", handleMediaChange);

      } catch (error) {
        console.error("Failed to configure MusicKit:", error);
        onError?.(error);
      }
    };

    configureMusicKit();

    return () => {
      if (musicKitRef.current) {
        musicKitRef.current.removeEventListener("playbackStateDidChange", handleStateChange);
        musicKitRef.current.removeEventListener("mediaItemDidChange", handleMediaChange);
      }
    };
  }, [isScriptLoaded, isConfigured]);

  // Load track when trackId changes
  useEffect(() => {
    if (!isConfigured || !trackId) return;

    const loadTrack = async () => {
      try {
        await musicKitRef.current.setQueue({
          song: trackId,
        });
      } catch (error) {
        console.error("Failed to load Apple Music track:", error);
        onError?.(error);
      }
    };

    loadTrack();
  }, [trackId, isConfigured]);

  const handleStateChange = (event: any) => {
    const state = musicKitRef.current?.playbackState;
    
    switch (state) {
      case window.MusicKit.PlaybackStates.playing:
        onStateChange?.("playing");
        break;
      case window.MusicKit.PlaybackStates.paused:
        onStateChange?.("paused");
        break;
      case window.MusicKit.PlaybackStates.stopped:
        onStateChange?.("stopped");
        break;
      case window.MusicKit.PlaybackStates.ended:
        onStateChange?.("ended");
        break;
    }
  };

  const handleMediaChange = (event: any) => {
    console.log("Apple Music media changed:", event);
  };

  return (
    <>
      <Script
        src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("Failed to load MusicKit script:", e);
          onError?.(e);
        }}
      />
      
      {/* Hidden player container */}
      <div id="apple-music-player" className="hidden" />
    </>
  );
}

/**
 * Create controller for Apple Music player
 */
export function createAppleMusicController(musicKitRef: React.RefObject<any>) {
  return {
    play: () => {
      musicKitRef.current?.play().catch(console.error);
    },
    pause: () => {
      musicKitRef.current?.pause();
    },
    stop: () => {
      musicKitRef.current?.stop();
    },
    seekTo: (seconds: number) => {
      if (musicKitRef.current) {
        musicKitRef.current.seekToTime(seconds);
      }
    },
    getCurrentTime: () => {
      return musicKitRef.current?.currentPlaybackTime || 0;
    },
    setVolume: (volume: number) => {
      if (musicKitRef.current) {
        musicKitRef.current.volume = volume / 100;
      }
    },
  };
}
