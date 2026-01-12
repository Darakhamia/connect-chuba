"use client";

import { useState, useEffect } from "react";
import { Profile } from "@prisma/client";
import { Plus, Users, MessageCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { FriendsList } from "@/components/friends/friends-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HomeScreenProps {
  profile: Profile;
  hasServers: boolean;
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

type Tab = "friends" | "messages";

export function HomeScreen({ profile, hasServers }: HomeScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);

  // Загружаем DM беседы
  useEffect(() => {
    fetchDMConversations();
    
    // Обновляем список каждые 5 секунд
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
    <div className="h-full flex">
      {/* DM Sidebar */}
      <div className="w-60 h-full bg-[#2b2d31] flex flex-col">
        {/* Search */}
        <div className="p-2">
          <button className="w-full h-7 px-2 rounded bg-zinc-900 text-zinc-500 text-sm text-left">
            Найти или начать беседу
          </button>
        </div>

        {/* Nav items */}
        <div className="px-2 space-y-0.5">
          <button
            onClick={() => setActiveTab("friends")}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors",
              activeTab === "friends"
                ? "bg-zinc-700/50 text-white"
                : "text-zinc-400 hover:bg-zinc-700/30 hover:text-zinc-200"
            )}
          >
            <Users className="w-5 h-5" />
            Друзья
          </button>
          
          <button
            onClick={() => setActiveTab("messages")}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors",
              activeTab === "messages"
                ? "bg-zinc-700/50 text-white"
                : "text-zinc-400 hover:bg-zinc-700/30 hover:text-zinc-200"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            Сообщения
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
                  className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-zinc-700/50 transition-colors group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conv.profile.imageUrl} />
                      <AvatarFallback className="bg-indigo-500 text-white text-xs">
                        {conv.profile.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#2b2d31]" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">
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
        <div className="p-2 bg-[#232428]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#232428]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-zinc-400">В сети</p>
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#313338] flex flex-col">
        {activeTab === "friends" && <FriendsList />}
        
        {activeTab === "messages" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Выберите беседу
              </h2>
              <p className="text-zinc-400">
                Или начните новую с друзьями
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
