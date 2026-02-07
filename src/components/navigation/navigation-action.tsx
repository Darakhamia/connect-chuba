"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NavigationAction() {
  const { onOpen } = useModal();

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onOpen("createServer")}
            className="group flex items-center"
          >
            <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-card group-hover:bg-primary/15 text-primary/50 group-hover:text-primary">
              <Plus className="transition" size={25} />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border-border">
          <p className="font-semibold">Добавить сервер</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

