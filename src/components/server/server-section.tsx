"use client";

import { Plus, Settings } from "lucide-react";
import { ChannelType, MemberRole } from "@prisma/client";
import { ServerWithMembersWithProfiles } from "@/types";
import { useModal } from "@/hooks/use-modal-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfiles;
}

export function ServerSection({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) {
  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-muted-foreground">
        {label}
      </p>
      
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onOpen("createChannel", { channelType })}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Создать канал</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {role === MemberRole.ADMIN && sectionType === "members" && (
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onOpen("members", { server })}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Settings className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Управление участниками</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

