"use client";

/* eslint-disable @next/next/no-img-element */
import { Plus, Compass, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data для демонстрации UI
const mockServers = [
  { id: "1", name: "Gaming Hub", imageUrl: null, hasNotification: true },
  { id: "2", name: "Dev Community", imageUrl: null, hasNotification: false },
  { id: "3", name: "Music Lovers", imageUrl: null, hasNotification: true },
  { id: "4", name: "Art Gallery", imageUrl: null, hasNotification: false },
  { id: "5", name: "Study Group", imageUrl: null, hasNotification: false },
];

interface ServerItemProps {
  id: string;
  name: string;
  imageUrl: string | null;
  hasNotification?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

function ServerItem({ name, imageUrl, hasNotification, isActive, onClick }: ServerItemProps) {
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group flex items-center mb-2">
            {/* Pill indicator */}
            <div
              className={cn(
                "server-pill w-1 h-0 -left-3",
                hasNotification && !isActive && "h-2",
                isActive && "h-10",
                "group-hover:h-5"
              )}
            />
            
            {/* Server icon */}
            <button
              onClick={onClick}
              className={cn(
                "flex-center w-12 h-12 rounded-[24px] overflow-hidden transition-all duration-200",
                "bg-channel-sidebar text-foreground",
                "hover:rounded-[16px] hover:bg-primary hover:text-primary-foreground",
                isActive && "rounded-[16px] bg-primary text-primary-foreground"
              )}
            >
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold">
                  {name.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border-border">
          <p className="font-semibold">{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "success";
}

function ActionButton({ icon, label, onClick, variant = "default" }: ActionButtonProps) {
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex-center w-12 h-12 rounded-[24px] transition-all duration-200 mb-2",
              "bg-channel-sidebar",
              variant === "default" && "text-discord-green hover:bg-discord-green hover:text-white hover:rounded-[16px]",
              variant === "success" && "text-discord-green hover:bg-discord-green hover:text-white hover:rounded-[16px]"
            )}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border-border">
          <p className="font-semibold">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ServerSidebar() {
  const activeServerId = "1"; // Будет управляться через state

  return (
    <div className="flex flex-col items-center w-[72px] h-full bg-server-sidebar py-3">
      {/* Home / Direct Messages */}
      <TooltipProvider delayDuration={50}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "flex-center w-12 h-12 rounded-[24px] mb-2 transition-all duration-200",
                "bg-channel-sidebar text-foreground",
                "hover:rounded-[16px] hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
                <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0C8.48074 0.31746 6.67795 0.877205 4.97186 1.67671C1.03567 7.48557 0.0336619 13.1444 0.534496 18.7173C2.54838 20.2423 4.79742 21.4178 7.21174 22.2007C7.74886 21.4691 8.22932 20.6992 8.64287 19.8987C7.85895 19.5987 7.10025 19.2356 6.37459 18.8133C6.57598 18.6686 6.77307 18.5176 6.96375 18.3618C11.6049 20.5241 16.6401 20.5241 21.2318 18.3618C21.4238 18.5189 21.6209 18.6699 21.8223 18.8133C21.0924 19.2369 20.3336 19.6 19.5497 19.9C19.9645 20.7018 20.4426 21.4691 20.9808 22.2007C23.3988 21.4191 25.6478 20.2436 27.6624 18.7186C28.2504 12.2432 26.6789 6.6321 23.0212 1.67671ZM9.68041 15.3217C8.39039 15.3217 7.33014 14.1329 7.33014 12.6631C7.33014 11.1933 8.35482 10.0045 9.68041 10.0045C11.006 10.0045 12.0662 11.1933 12.0305 12.6631C12.0305 14.1329 11.006 15.3217 9.68041 15.3217ZM18.3161 15.3217C17.0261 15.3217 15.9659 14.1329 15.9659 12.6631C15.9659 11.1933 16.9905 10.0045 18.3161 10.0045C19.6417 10.0045 20.702 11.1933 20.6662 12.6631C20.6662 14.1329 19.6417 15.3217 18.3161 15.3217Z" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover border-border">
            <p className="font-semibold">Личные сообщения</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator className="h-[2px] w-8 bg-border rounded-full my-2" />

      {/* Server list */}
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center px-3">
          {mockServers.map((server) => (
            <ServerItem
              key={server.id}
              {...server}
              isActive={server.id === activeServerId}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="h-[2px] w-8 bg-border rounded-full my-2" />

      {/* Action buttons */}
      <div className="flex flex-col items-center px-3">
        <ActionButton
          icon={<Plus className="w-6 h-6" />}
          label="Добавить сервер"
          variant="success"
        />
        <ActionButton
          icon={<Compass className="w-6 h-6" />}
          label="Обзор серверов"
        />
        <ActionButton
          icon={<Download className="w-6 h-6" />}
          label="Скачать приложение"
        />
      </div>
    </div>
  );
}

