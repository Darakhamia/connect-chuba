"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
}

// YouTube Player API state codes
export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

export function YouTubePlayer({ videoId, onReady, onStateChange, onError }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      setIsAPIReady(true);
      return;
    }

    // Load API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API ready callback
    (window as any).onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
    };

    return () => {
      delete (window as any).onYouTubeIframeAPIReady;
    };
  }, []);

  // Create player when API is ready
  useEffect(() => {
    if (!isAPIReady || !containerRef.current || !videoId) return;

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Create new player
    playerRef.current = new (window as any).YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          console.log("YouTube player ready");
          onReady?.();
        },
        onStateChange: (event: any) => {
          console.log("YouTube player state:", event.data);
          onStateChange?.(event.data);
        },
        onError: (event: any) => {
          console.error("YouTube player error:", event.data);
          onError?.(event.data);
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isAPIReady, videoId]);

  return (
    <div className="hidden">
      <div ref={containerRef} />
    </div>
  );
}

// Export player controller
export const createYouTubeController = (playerRef: React.MutableRefObject<any>) => ({
  play: () => {
    playerRef.current?.playVideo();
  },
  pause: () => {
    playerRef.current?.pauseVideo();
  },
  seekTo: (seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  },
  setVolume: (volume: number) => {
    playerRef.current?.setVolume(volume);
  },
  getCurrentTime: (): number => {
    return playerRef.current?.getCurrentTime() || 0;
  },
  getDuration: (): number => {
    return playerRef.current?.getDuration() || 0;
  },
  getState: (): number => {
    return playerRef.current?.getPlayerState() || YT_STATE.UNSTARTED;
  },
});
