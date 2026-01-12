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
  
  // Store widget in window for global access from controller
  useEffect(() => {
    if (widgetRef.current) {
      (window as any).__soundCloudWidget = widgetRef.current;
      console.log("🌐 Stored widget in window.__soundCloudWidget");
    }
  }, [widgetRef.current]);

  // Load SoundCloud Widget API script
  const handleScriptLoad = () => {
    console.log("📦 SoundCloud API script loaded");
    setIsScriptLoaded(true);
  };

  // Initialize widget when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !iframeRef.current) {
      console.log("⏳ Waiting for script or iframe...", { isScriptLoaded, hasIframe: !!iframeRef.current });
      return;
    }

    console.log("🔧 Initializing SoundCloud widget for URL:", url);

    // Give iframe some time to load before initializing widget
    const initTimeout = setTimeout(() => {
      try {
        if (!window.SC || !window.SC.Widget) {
          console.error("❌ window.SC.Widget is not available!");
          onError?.(new Error("SoundCloud Widget API not loaded"));
          return;
        }

        widgetRef.current = window.SC.Widget(iframeRef.current);
        console.log("📦 Widget instance created:", widgetRef.current);

        // Bind events
        widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
          console.log("✅ SoundCloud widget ready!");
          (window as any).__soundCloudWidget = widgetRef.current;
          
          // Get current track info for debugging
          widgetRef.current.getCurrentSound((sound: any) => {
            console.log("🎵 Current SoundCloud track:", sound);
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
        console.error("❌ Failed to initialize SoundCloud widget:", error);
        onError?.(error);
      }
    }, 500); // Wait 500ms for iframe to load

    return () => {
      clearTimeout(initTimeout);
      if (widgetRef.current) {
        widgetRef.current.unbind(window.SC.Widget.Events.READY);
        widgetRef.current.unbind(window.SC.Widget.Events.PLAY);
        widgetRef.current.unbind(window.SC.Widget.Events.PAUSE);
        widgetRef.current.unbind(window.SC.Widget.Events.FINISH);
        widgetRef.current.unbind(window.SC.Widget.Events.ERROR);
      }
    };
  }, [isScriptLoaded, url]);

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

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&buying=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=false`;

  console.log("🔗 SoundCloud embed URL:", embedUrl);

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("❌ Failed to load SoundCloud Widget API:", e);
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
        onLoad={() => {
          console.log("📦 SoundCloud iframe loaded");
        }}
        onError={(e) => {
          console.error("❌ SoundCloud iframe error:", e);
        }}
      />
    </>
  );
}

/**
 * Create controller for SoundCloud player
 * Uses window.__soundCloudWidget for global access
 */
export function createSoundCloudController(widgetRef?: React.RefObject<any>) {
  const getWidget = () => {
    return (window as any).__soundCloudWidget || widgetRef?.current;
  };

  return {
    play: () => {
      console.log("🎵 SoundCloud controller: play()");
      const widget = getWidget();
      if (widget) {
        widget.play();
        console.log("▶️ SoundCloud play command sent");
      } else {
        console.error("❌ SoundCloud widget not available");
      }
    },
    pause: () => {
      console.log("⏸️ SoundCloud controller: pause()");
      const widget = getWidget();
      if (widget) {
        widget.pause();
      }
    },
    seekTo: (seconds: number) => {
      console.log("⏩ SoundCloud controller: seekTo", seconds);
      const widget = getWidget();
      if (widget) {
        widget.seekTo(seconds * 1000); // SoundCloud uses milliseconds
      }
    },
    getCurrentTime: (callback: (time: number) => void) => {
      const widget = getWidget();
      if (!widget) {
        callback(0);
        return;
      }
      widget.getPosition((position: number) => {
        callback(position / 1000); // Convert ms to seconds
      });
    },
    setVolume: (volume: number) => {
      console.log("🔊 SoundCloud controller: setVolume", volume);
      const widget = getWidget();
      if (widget) {
        widget.setVolume(volume);
      }
    },
  };
}
