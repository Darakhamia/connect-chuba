"use client";

import { useState } from "react";
import { 
  Hash, 
  Volume2, 
  Video, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings, 
  UserPlus,
  Mic,
  Headphones,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockServer = {
  id: "1",
  name: "Gaming Hub",
  imageUrl: null,
};

const mockCategories = [
  {
    id: "cat1",
    name: "Информация",
    channels: [
      { id: "ch1", name: "правила", type: "TEXT" as const },
      { id: "ch2", name: "анонсы", type: "TEXT" as const },
    ],
  },
  {
    id: "cat2",
    name: "Общение",
    channels: [
      { id: "ch3", name: "общий-чат", type: "TEXT" as const },
      { id: "ch4", name: "мемы", type: "TEXT" as const },
      { id: "ch5", name: "музыка", type: "TEXT" as const },
    ],
  },
  {
    id: "cat3",
    name: "Голосовые",
    channels: [
      { id: "ch6", name: "Общий голос", type: "AUDIO" as const },
      { id: "ch7", name: "Игровая комната", type: "AUDIO" as const },
      { id: "ch8", name: "Стрим", type: "VIDEO" as const },
    ],
  },
];

const mockUser = {
  id: "user1",
  name: "Игрок123",
  imageUrl: null,
  status: "online" as const,
};

type ChannelType = "TEXT" | "AUDIO" | "VIDEO";

interface ChannelItemProps {
  id: string;
  name: string;
  type: ChannelType;
  isActive?: boolean;
  onClick?: () => void;
}

function ChannelIcon({ type, className }: { type: ChannelType; className?: string }) {
  const icons = {
    TEXT: Hash,
    AUDIO: Volume2,
    VIDEO: Video,
  };
  const Icon = icons[type];
  return <Icon className={cn("w-5 h-5", className)} />;
}

function ChannelItem({ name, type, isActive, onClick }: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md group",
        "text-muted-foreground hover:text-foreground",
        "channel-hover",
        isActive && "bg-sidebar-accent text-foreground"
      )}
    >
      <ChannelIcon type={type} className="shrink-0 text-muted-foreground" />
      <span className="truncate text-sm font-medium">{name}</span>
      
      {/* Action icons on hover */}
      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1 hover:text-foreground rounded">
                <UserPlus className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Создать приглашение</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1 hover:text-foreground rounded">
                <Settings className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Настройки канала</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </button>
  );
}

interface CategoryProps {
  id: string;
  name: string;
  channels: Array<{ id: string; name: string; type: ChannelType }>;
  activeChannelId?: string;
}

function Category({ name, channels, activeChannelId }: CategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      {/* Category header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-0.5 px-0.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground group"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span className="truncate">{name}</span>
        
        {/* Add channel button */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="ml-auto p-0.5 opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Создать канал</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </button>

      {/* Channel list */}
      {isExpanded && (
        <div className="space-y-0.5 pl-0.5">
          {channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              {...channel}
              isActive={channel.id === activeChannelId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserPanel() {
  return (
    <div className="flex items-center gap-2 p-2 bg-user-panel">
      {/* User avatar */}
      <div className="relative">
        <Avatar className="w-8 h-8">
          <AvatarImage src={mockUser.imageUrl || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {mockUser.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-user-panel",
          mockUser.status === "online" && "bg-discord-green"
        )} />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{mockUser.name}</p>
        <p className="text-xs text-muted-foreground truncate">В сети</p>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-0.5">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground">
                <Mic className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Отключить микрофон</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground">
                <Headphones className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Отключить звук</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground">
                <Settings2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Настройки пользователя</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function ChannelSidebar() {
  const activeChannelId = "ch3";

  return (
    <div className="flex flex-col w-60 h-full bg-channel-sidebar">
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between w-full px-4 h-12 border-b border-border hover:bg-sidebar-accent transition-colors">
            <h2 className="font-semibold truncate">{mockServer.name}</h2>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem className="text-primary cursor-pointer">
            <UserPlus className="w-4 h-4 mr-2" />
            Пригласить людей
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Настройки сервера
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Создать канал
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Создать категорию
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels list */}
      <ScrollArea className="flex-1 px-2 pt-4">
        {mockCategories.map((category) => (
          <Category
            key={category.id}
            {...category}
            activeChannelId={activeChannelId}
          />
        ))}
      </ScrollArea>

      {/* User panel */}
      <UserPanel />
    </div>
  );
}

