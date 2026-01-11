"use client";

import { useState } from "react";
import { Profile } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import { Plus, Users, MessageCircle, Settings, Sparkles } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { FriendsList } from "@/components/friends/friends-list";
import { cn } from "@/lib/utils";

interface HomeScreenProps {
  profile: Profile;
  hasServers: boolean;
}

type Tab = "friends" | "messages";

export function HomeScreen({ profile, hasServers }: HomeScreenProps) {
  const { onOpen } = useModal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  return (
    <div className="h-full flex">
      {/* Левая панель навигации */}
      <div className="w-[72px] h-full bg-[#1e1f22] flex flex-col items-center py-3">
        {/* Логотип ECHO */}
        <button
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2 hover:rounded-xl transition-all duration-200"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
        
        <div className="w-8 h-[2px] bg-zinc-700 rounded-full my-2" />
        
        {/* Добавить сервер */}
        <button
          onClick={() => onOpen("createServer")}
          className="w-12 h-12 rounded-3xl bg-[#313338] hover:bg-emerald-500 hover:rounded-xl flex items-center justify-center transition-all duration-200 group"
        >
          <Plus className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
        </button>
        
        <div className="flex-1" />
        
        <div className="flex flex-col items-center gap-2 mb-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

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

        {/* DM list placeholder */}
        <div className="flex-1 px-2 py-2">
          <p className="text-xs text-zinc-500 text-center py-4">
            Пока нет бесед
          </p>
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
