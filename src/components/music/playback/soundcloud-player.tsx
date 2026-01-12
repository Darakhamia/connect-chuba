"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    SC: any;
  }
}

interface SoundCloudPlayerProps {
  url: string;
  onReady?: () => void;
  onStateChange?: (state: "playing" | "paused" | "stopped" | "ended") => void;
  onError?: (error: any) => void;
}

export function SoundCloudPlayer({
  url,
  onReady,
  onStateChange,
  onError,
}: SoundCloudPlayerProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const widgetRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load SoundCloud Widget API script
  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // Initialize widget when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !iframeRef.current) return;

    console.log("Initializing SoundCloud widget for URL:", url);

    try {
      widgetRef.current = window.SC.Widget(iframeRef.current);

      // Bind events
      widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
        console.log("✅ SoundCloud widget ready!");
        
        // Get current track info for debugging
        widgetRef.current.getCurrentSound((sound: any) => {
          console.log("Current SoundCloud track:", sound);
        });
        
        onReady?.();
      });

      widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
        console.log("▶️ SoundCloud started playing");
        onStateChange?.("playing");
      });

      widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
        console.log("⏸️ SoundCloud paused");
        onStateChange?.("paused");
      });

      widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
        console.log("⏹️ SoundCloud finished");
        onStateChange?.("ended");
      });

      widgetRef.current.bind(window.SC.Widget.Events.ERROR, (error: any) => {
        console.error("❌ SoundCloud error:", error);
        onError?.(error);
      });

    } catch (error) {
      console.error("Failed to initialize SoundCloud widget:", error);
      onError?.(error);
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.unbind(window.SC.Widget.Events.READY);
        widgetRef.current.unbind(window.SC.Widget.Events.PLAY);
        widgetRef.current.unbind(window.SC.Widget.Events.PAUSE);
        widgetRef.current.unbind(window.SC.Widget.Events.FINISH);
        widgetRef.current.unbind(window.SC.Widget.Events.ERROR);
      }
    };
  }, [isScriptLoaded]);

  // Update URL when it changes
  useEffect(() => {
    if (!widgetRef.current) return;

    widgetRef.current.load(url, {
      auto_play: false,
      buying: false,
      sharing: false,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
    });
  }, [url]);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&buying=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=false`;

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("Failed to load SoundCloud Widget API:", e);
          onError?.(e);
        }}
      />

      <iframe
        ref={iframeRef}
        id="soundcloud-player"
        src={embedUrl}
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        className="hidden"
      />
    </>
  );
}

/**
 * Create controller for SoundCloud player
 */
export function createSoundCloudController(widgetRef: React.RefObject<any>) {
  return {
    play: () => {
      console.log("🎵 SoundCloud controller: play()");
      if (widgetRef.current) {
        widgetRef.current.play();
      } else {
        console.error("SoundCloud widget not initialized");
      }
    },
    pause: () => {
      console.log("⏸️ SoundCloud controller: pause()");
      widgetRef.current?.pause();
    },
    seekTo: (seconds: number) => {
      console.log("⏩ SoundCloud controller: seekTo", seconds);
      widgetRef.current?.seekTo(seconds * 1000); // SoundCloud uses milliseconds
    },
    getCurrentTime: (callback: (time: number) => void) => {
      if (!widgetRef.current) {
        callback(0);
        return;
      }
      widgetRef.current.getPosition((position: number) => {
        callback(position / 1000); // Convert ms to seconds
      });
    },
    setVolume: (volume: number) => {
      console.log("🔊 SoundCloud controller: setVolume", volume);
      widgetRef.current?.setVolume(volume);
    },
  };
}
