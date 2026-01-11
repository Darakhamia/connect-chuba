"use client";

import { Profile } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import { Plus, Users, MessageCircle, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

interface HomeScreenProps {
  profile: Profile;
  hasServers: boolean;
}

export function HomeScreen({ profile, hasServers }: HomeScreenProps) {
  const { onOpen } = useModal();
  const router = useRouter();

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

      {/* Основной контент */}
      <div className="flex-1 bg-[#313338]">
        {/* Заголовок */}
        <div className="h-12 border-b border-zinc-800 flex items-center px-4">
          <Users className="w-5 h-5 text-zinc-400 mr-2" />
          <span className="font-semibold text-white">Друзья</span>
        </div>

        {/* Контент */}
        <div className="flex-1 p-6">
          {/* Приветствие */}
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Добро пожаловать в ECHO, {profile.name}!
            </h1>
            
            <p className="text-zinc-400 mb-8">
              Общайтесь с друзьями, создавайте серверы и наслаждайтесь голосовыми звонками
            </p>

            {/* Действия */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onOpen("createServer")}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать сервер
              </Button>
              
              <Button
                variant="outline"
                className="border-zinc-600 hover:bg-zinc-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Найти друзей
              </Button>
            </div>

            {/* Быстрые действия */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
              <div className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer">
                <MessageCircle className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Сообщения</h3>
                <p className="text-sm text-zinc-400">Личные чаты с друзьями</p>
              </div>
              
              <div 
                className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer"
                onClick={() => onOpen("createServer")}
              >
                <Plus className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Создать сервер</h3>
                <p className="text-sm text-zinc-400">Ваше собственное пространство</p>
              </div>
              
              <div className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer">
                <Settings className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white">Настройки</h3>
                <p className="text-sm text-zinc-400">Персонализация ECHO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
