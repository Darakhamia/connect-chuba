"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle, Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MusicPlaybackManager } from "./playback/music-playback-manager";

interface Track {
  id: string;
  source: string;
  sourceId: string;
  title: string;
  artist?: string;
  durationMs: number;
  thumbnailUrl?: string;
  originalUrl?: string;
  uploadedFileUrl?: string;
}

interface QueueItem {
  id: string;
  track: Track;
  addedBy: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface MusicSession {
  id: string;
  state: "IDLE" | "PLAYING" | "PAUSED" | "LOADING";
  currentTrack?: Track;
  volume: number;
  loopMode: "OFF" | "ONE" | "ALL";
  shuffle: boolean;
  currentPositionMs: number;
}

interface MusicPanelProps {
  serverId: string;
  voiceChannelId: string;
  onClose: () => void;
}

export function MusicPanel({ serverId, voiceChannelId, onClose }: MusicPanelProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<MusicSession | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initSession();
    // Faster polling for smoother UI (1 second instead of 3)
    const interval = setInterval(fetchSessionState, 1000);
    return () => clearInterval(interval);
  }, [serverId, voiceChannelId]);

  const initSession = async () => {
    try {
      const res = await fetch("/api/music/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId, voiceChannelId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession({
          id: data.id,
          state: data.state,
          currentTrack: data.currentTrack,
          volume: data.volume,
          loopMode: data.loopMode,
          shuffle: data.shuffle,
          currentPositionMs: 0,
        });
        setQueue(data.queue || []);
      }
    } catch (error) {
      console.error("Failed to init session:", error);
    }
  };

  const fetchSessionState = async () => {
    if (!session || isSeeking) return; // Don't update while user is seeking

    try {
      const res = await fetch(`/api/music/session/${session.id}/state`);
      if (res.ok) {
        const data = await res.json();
        
        // Only update if something actually changed
        const hasChanges = 
          session.state !== data.state ||
          session.currentTrack?.id !== data.currentTrack?.id ||
          session.volume !== data.volume ||
          session.loopMode !== data.loopMode ||
          session.shuffle !== data.shuffle ||
          Math.abs(session.currentPositionMs - (data.currentPositionMs || 0)) > 2000; // Update if drift > 2s

        if (hasChanges || data.state === "PLAYING") {
          setSession({
            id: data.id,
            state: data.state,
            currentTrack: data.currentTrack,
            volume: data.volume,
            loopMode: data.loopMode,
            shuffle: data.shuffle,
            currentPositionMs: data.currentPositionMs || 0,
          });
        }
        
        // Always update queue if it changed
        if (JSON.stringify(queue) !== JSON.stringify(data.queue || [])) {
          setQueue(data.queue || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch session state:", error);
    }
  };

  const handleAddTrack = async () => {
    if (!url.trim() || !session) return;

    setIsLoading(true);
    try {
      // Resolve URL
      const resolveRes = await fetch("/api/music/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!resolveRes.ok) {
        throw new Error("Failed to resolve URL");
      }

      const resolved = await resolveRes.json();

      if (resolved.type === "track") {
        // Add single track to queue
        await fetch(`/api/music/session/${session.id}/queue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: resolved.track.id }),
        });

        toast.success(`Added: ${resolved.track.title}`);
      } else {
        // Add playlist tracks
        const trackIds = resolved.playlist.tracks.map((t: Track) => t.id);
        await fetch(`/api/music/session/${session.id}/queue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackIds }),
        });

        toast.success(`Added ${trackIds.length} tracks from playlist`);
      }

      setUrl("");
      fetchSessionState();
    } catch (error) {
      console.error("Failed to add track:", error);
      toast.error("Failed to add track. Check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleControl = async (action: string, value?: any) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/music/session/${session.id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });

      if (res.ok) {
        // Immediate UI update for better responsiveness
        if (action === "play") {
          setSession({ ...session, state: "PLAYING" });
        } else if (action === "pause") {
          setSession({ ...session, state: "PAUSED" });
        }
        // Fetch full state after a short delay
        setTimeout(fetchSessionState, 200);
      }
    } catch (error) {
      console.error("Control error:", error);
    }
  };

  const handleSeek = (positionMs: number) => {
    if (!session) return;
    
    // Update UI immediately for smooth experience
    setSession({ ...session, currentPositionMs: positionMs });
    setIsSeeking(true);

    // Debounce actual API call
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }

    seekTimeoutRef.current = setTimeout(() => {
      handleControl("seek", positionMs);
      setIsSeeking(false);
    }, 500); // Wait 500ms after user stops dragging
  };

  const handleSkipSeconds = (seconds: number) => {
    if (!session?.currentTrack) return;
    const newPosition = Math.max(0, Math.min(
      session.currentPositionMs + (seconds * 1000),
      session.currentTrack.durationMs
    ));
    handleSeek(newPosition);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTrackEnded = () => {
    // Auto-skip to next track
    handleControl("skip");
  };

  return (
    <div className="w-96 h-full bg-channel-sidebar border-l border-border flex flex-col">
      {/* Playback Manager (hidden) */}
      {session && (
        <MusicPlaybackManager
          sessionId={session.id}
          currentTrack={session.currentTrack || null}
          state={session.state}
          startedAt={null}
          offsetMs={0}
          volume={session.volume}
          onEnded={handleTrackEnded}
        />
      )}

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Music</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Track Input */}
      <div className="p-4 border-b border-border space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube, Spotify, or SoundCloud link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
            disabled={isLoading}
            className="flex-1 bg-input border-border"
          />
          <Button onClick={handleAddTrack} disabled={isLoading || !url.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Upload className="w-3 h-3 mr-2" />
            Upload Audio
          </Button>
        </div>
      </div>

      {/* Now Playing */}
      {session?.currentTrack && (
        <div className="p-4 border-b border-border space-y-3">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Now Playing</p>
          <div className="flex gap-3">
            {session.currentTrack.thumbnailUrl && (
              <img
                src={session.currentTrack.thumbnailUrl}
                alt={session.currentTrack.title}
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{session.currentTrack.title}</p>
              {session.currentTrack.artist && (
                <p className="text-sm text-muted-foreground truncate">{session.currentTrack.artist}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(session.currentPositionMs)} / {formatTime(session.currentTrack.durationMs)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Slider
            value={[session.currentPositionMs]}
            max={session.currentTrack.durationMs}
            step={1000}
            onValueChange={([value]) => handleSeek(value)}
            className="w-full"
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleControl("shuffle")}
              className={cn(session.shuffle && "text-primary")}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSkipSeconds(-10)}
              title="Назад 10 сек"
            >
              -10s
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleControl("back")} title="Previous">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => handleControl(session.state === "PLAYING" ? "pause" : "play")}
              className="bg-primary hover:bg-primary/90"
              title={session.state === "PLAYING" ? "Pause" : "Play"}
            >
              {session.state === "PLAYING" ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleControl("skip")} title="Next">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSkipSeconds(10)}
              title="Вперед 10 сек"
            >
              +10s
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const modes: ("OFF" | "ONE" | "ALL")[] = ["OFF", "ONE", "ALL"];
                const currentIndex = modes.indexOf(session.loopMode);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                handleControl("loop", nextMode);
              }}
              className={cn(session.loopMode !== "OFF" && "text-primary")}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[session.volume]}
              max={100}
              step={1}
              onValueChange={([value]) => handleControl("volume", value)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{session.volume}%</span>
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Queue ({queue.length})
          </p>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {queue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Queue is empty. Add some music!
              </p>
            ) : (
              queue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-secondary group"
                >
                  <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                  {item.track.thumbnailUrl && (
                    <img
                      src={item.track.thumbnailUrl}
                      alt={item.track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.track.title}
                    </p>
                    {item.track.artist && (
                      <p className="text-xs text-muted-foreground truncate">{item.track.artist}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={async () => {
                      await fetch(`/api/music/session/${session?.id}/queue?itemId=${item.id}`, {
                        method: "DELETE",
                      });
                      fetchSessionState();
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
