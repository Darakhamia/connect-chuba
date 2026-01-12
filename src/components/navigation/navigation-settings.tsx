"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NavigationSettings() {
  const router = useRouter();

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-700 hover:bg-primary hover:rounded-[16px] transition-all duration-200 text-zinc-400 hover:text-white mb-3"
          >
            <Settings className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border-border">
          <p className="font-semibold">Настройки</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
