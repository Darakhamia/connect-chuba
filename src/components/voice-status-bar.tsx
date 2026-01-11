"use client";

import { useVoice } from "@/hooks/use-voice-store";
import { useRouter } from "next/navigation";
import { Mic, Video, PhoneOff, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VoiceStatusBar() {
  const router = useRouter();
  const { 
    activeChannelId, 
    activeChannelName, 
    activeServerId,
    activeServerName,
    isVideo,
    leaveVoice 
  } = useVoice();

  if (!activeChannelId) return null;

  const handleGoToChannel = () => {
    router.push(`/servers/${activeServerId}/channels/${activeChannelId}`);
  };

  const handleLeave = () => {
    leaveVoice();
  };

  return (
    <div className="fixed bottom-0 left-[72px] right-0 h-14 bg-[#1a1b1e] border-t border-border z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Левая часть - информация о канале */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isVideo ? "bg-indigo-500" : "bg-green-500"
          )}>
            {isVideo ? (
              <Video className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {activeChannelName}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeServerName} • {isVideo ? "Видео" : "Голос"}
            </p>
          </div>
        </div>

        {/* Правая часть - кнопки */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoToChannel}
            className="text-muted-foreground hover:text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLeave}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
