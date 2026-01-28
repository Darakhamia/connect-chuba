"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordComplete(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    setDuration(0);
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg">
      {!audioBlob ? (
        // Recording UI
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "p-2 rounded-full transition",
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-zinc-700 hover:bg-zinc-600"
            )}
          >
            {isRecording ? (
              <Square className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5 text-white" />
            )}
          </button>

          <div className="flex-1">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-white">Запись...</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatDuration(duration)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Нажмите для записи голосового сообщения
              </span>
            )}
          </div>

          <button
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-zinc-700 transition text-muted-foreground hover:text-white"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </>
      ) : (
        // Preview UI
        <>
          <VoicePlayer audioBlob={audioBlob} duration={duration} />

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-zinc-700 transition text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface VoicePlayerProps {
  audioUrl?: string;
  audioBlob?: Blob;
  duration?: number;
}

export function VoicePlayer({ audioUrl, audioBlob, duration: initialDuration }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    if (audioBlob) {
      audio.src = URL.createObjectURL(audioBlob);
    } else if (audioUrl) {
      audio.src = audioUrl;
    }

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      if (audioBlob) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, [audioUrl, audioBlob]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 flex-1">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-white" />
        ) : (
          <Play className="h-4 w-4 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Waveform visualization (simplified as bars) */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-8 flex items-center gap-0.5 cursor-pointer"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            const isActive = (i / 40) * 100 <= progress;
            const height = Math.random() * 60 + 20; // Random heights for visual effect
            return (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-colors",
                  isActive ? "bg-blue-500" : "bg-zinc-600"
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

// Component for displaying voice messages in chat
interface VoiceMessageDisplayProps {
  audioUrl: string;
  duration?: number;
}

export function VoiceMessageDisplay({ audioUrl, duration }: VoiceMessageDisplayProps) {
  return (
    <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg max-w-sm">
      <VoicePlayer audioUrl={audioUrl} duration={duration} />
    </div>
  );
}
