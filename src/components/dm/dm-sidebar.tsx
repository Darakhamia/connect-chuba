"use client";

import { useState, useEffect } from "react";
import { Profile } from "@prisma/client";
import { Plus, Users, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPanel } from "@/components/user-panel";
import { cn } from "@/lib/utils";

interface DMSidebarProps {
  profile: Profile;
}

interface DMConversation {
  id: string;
  profile: Profile;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export function DMSidebar({ profile }: DMSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);

  // Определяем активную вкладку
  const isHome = pathname === "/";
  const isDM = pathname?.startsWith("/dm/");
  const currentDMId = isDM ? pathname?.split("/dm/")[1] : null;

  useEffect(() => {
    fetchDMConversations();
    const interval = setInterval(fetchDMConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDMConversations = async () => {
    try {
      const res = await fetch("/api/dm");
      if (res.ok) {
        const data = await res.json();
        setDmConversations(data);
      }
    } catch (error) {
      console.error("Error fetching DM conversations:", error);
    }
  };

  return (
    <div className="w-60 h-full bg-channel-sidebar flex flex-col">
      {/* Search */}
      <div className="p-2">
        <button className="w-full h-7 px-2 rounded bg-zinc-900 text-zinc-500 text-sm text-left">
          Найти или начать беседу
        </button>
      </div>

      {/* Nav items */}
      <div className="px-2 space-y-0.5">
        <button
          onClick={() => router.push("/")}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors",
            isHome && !isDM
              ? "bg-accent/20 text-white"
              : "text-zinc-400 hover:bg-zinc-700/30 hover:text-zinc-200"
          )}
        >
          <Users className="w-5 h-5" />
          Друзья
        </button>
      </div>

      <div className="h-[1px] bg-zinc-700 mx-2 my-2" />

      {/* DM header */}
      <div className="px-4 py-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase">
          Личные сообщения
        </span>
        <button className="text-zinc-400 hover:text-white">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* DM list */}
      <div className="flex-1 px-2 py-2 overflow-y-auto">
        {dmConversations.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">
            Пока нет бесед
          </p>
        ) : (
          <div className="space-y-0.5">
            {dmConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/dm/${conv.id}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors group",
                  currentDMId === conv.id
                    ? "bg-accent/20 text-white"
                    : "hover:bg-zinc-700/50"
                )}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conv.profile.imageUrl} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {conv.profile.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-channel-sidebar" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    currentDMId === conv.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {conv.profile.name}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs text-zinc-500 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User panel */}
      <UserPanel profile={profile} />
    </div>
  );
}
