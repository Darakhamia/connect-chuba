"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, UserStatus } from "@prisma/client";
import { Settings, Circle, Moon, MinusCircle, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserPanelProps {
  profile: Profile;
}

const statusOptions = [
  { value: "ONLINE" as UserStatus, label: "В сети", icon: Circle, color: "text-green-500", fill: "fill-green-500" },
  { value: "IDLE" as UserStatus, label: "Не активен", icon: Moon, color: "text-yellow-500", fill: "fill-yellow-500" },
  { value: "DND" as UserStatus, label: "Не беспокоить", icon: MinusCircle, color: "text-red-500", fill: "fill-red-500" },
  { value: "INVISIBLE" as UserStatus, label: "Невидимый", icon: EyeOff, color: "text-zinc-500", fill: "fill-zinc-500" },
];

export function UserPanel({ profile }: UserPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<UserStatus>(profile.status || "ONLINE");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        const statusLabel = statusOptions.find(s => s.value === newStatus)?.label;
        toast.success(`Статус: ${statusLabel}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Не удалось изменить статус");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-2 bg-[#232428]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-2 p-1 rounded hover:bg-zinc-700/50 transition-colors">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.imageUrl} />
                <AvatarFallback className="bg-indigo-500 text-white text-xs">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#232428]",
                status === "ONLINE" && "bg-green-500",
                status === "IDLE" && "bg-yellow-500",
                status === "DND" && "bg-red-500",
                status === "INVISIBLE" && "bg-zinc-500",
                status === "OFFLINE" && "bg-zinc-500",
              )} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-zinc-400 truncate">
                {profile.bio || currentStatus.label}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="top" 
          align="start" 
          className="w-56 bg-[#111214] border-zinc-800"
        >
          {/* User card */}
          <div className="p-3">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.imageUrl} />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white">{profile.name}</p>
                <p className="text-xs text-zinc-400">{profile.email}</p>
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-zinc-300 bg-zinc-800/50 p-2 rounded">
                {profile.bio}
              </p>
            )}
          </div>
          
          <DropdownMenuSeparator className="bg-zinc-800" />
          
          {/* Status selection */}
          <div className="p-1">
            <p className="px-2 py-1 text-xs font-semibold text-zinc-400 uppercase">
              Статус
            </p>
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    "cursor-pointer",
                    status === option.value && "bg-zinc-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mr-2", option.color, option.fill)} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
          
          <DropdownMenuSeparator className="bg-zinc-800" />
          
          {/* Settings */}
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            Настройки
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
