"use client";

import { useVoice } from "@/hooks/use-voice-store";
import { useRouter, usePathname } from "next/navigation";
import { PhoneOff, Maximize2, Signal } from "lucide-react";

export function VoiceStatusBar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeChannelId,
    activeChannelName,
    activeServerId,
    activeServerName,
    isVideo,
    leaveVoice
  } = useVoice();

  const isOnVoiceChannelPage = pathname === `/servers/${activeServerId}/channels/${activeChannelId}`;

  if (!activeChannelId || isOnVoiceChannelPage) return null;

  const handleGoToChannel = () => {
    router.push(`/servers/${activeServerId}/channels/${activeChannelId}`);
  };

  return (
    <div className="fixed bottom-0 left-[72px] z-50 w-[240px]">
      {/* Connection status */}
      <div className="bg-[#1a1a1a] border-t border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Signal className="w-4 h-4 text-green-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-500">
                Голосовая связь подключена
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeChannelName} / {activeServerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleGoToChannel}
              className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Перейти в канал"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={leaveVoice}
              className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
              title="Отключиться"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
