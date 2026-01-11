"use client";

import { useParams, useRouter } from "next/navigation";
import { Hash, Mic, Video, Edit, Trash, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { useModal } from "@/hooks/use-modal-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export function ServerChannel({ channel, server, role }: ServerChannelProps) {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const Icon = iconMap[channel.type];

  const onClick = () => {
    router.push(`/servers/${server.id}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: "editChannel" | "deleteChannel") => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-sidebar-accent transition mb-1",
        params?.channelId === channel.id && "bg-sidebar-accent"
      )}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-muted-foreground" />
      
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-muted-foreground group-hover:text-foreground transition",
          params?.channelId === channel.id && "text-foreground"
        )}
      >
        {channel.name}
      </p>
      
      {/* Действия (только для не-general каналов) */}
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2 opacity-0 group-hover:opacity-100 transition">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Edit
                  onClick={(e) => onAction(e, "editChannel")}
                  className="w-4 h-4 text-muted-foreground hover:text-foreground transition cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Редактировать</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Trash
                  onClick={(e) => onAction(e, "deleteChannel")}
                  className="w-4 h-4 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Удалить</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Иконка блокировки для general канала */}
      {channel.name === "general" && (
        <Lock className="ml-auto w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

