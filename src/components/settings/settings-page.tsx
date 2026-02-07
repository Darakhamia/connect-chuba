"use client";

import { useState } from "react";
import { Profile } from "@prisma/client";
import { 
  User, 
  Palette, 
  Mic, 
  Bell, 
  Shield, 
  LogOut,
  X,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "./profile-settings";
import { AppearanceSettings } from "./appearance-settings";
import { VoiceSettings } from "./voice-settings";
import { NotificationSettings } from "./notification-settings";

interface SettingsPageProps {
  profile: Profile;
}

type SettingsTab = "profile" | "appearance" | "voice" | "notifications" | "privacy";

const tabs = [
  { id: "profile" as const, label: "Профиль", icon: User },
  { id: "appearance" as const, label: "Внешний вид", icon: Palette },
  { id: "voice" as const, label: "Голос и видео", icon: Mic },
  { id: "notifications" as const, label: "Уведомления", icon: Bell },
  { id: "privacy" as const, label: "Конфиденциальность", icon: Shield },
];

export function SettingsPage({ profile }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const router = useRouter();
  const { signOut } = useClerk();

  const handleClose = () => {
    router.back();
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="h-full flex bg-[#0e0e0e]">
      {/* Sidebar */}
      <div className="w-[232px] bg-[#0a0a0a] flex flex-col">
        <div className="flex-1 p-2">
          {/* Back button on mobile */}
          <button
            onClick={handleClose}
            className="md:hidden flex items-center gap-2 text-[#555] hover:text-foreground p-2 mb-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>

          <div className="px-2 py-1.5 text-xs font-semibold text-[#555] uppercase">
            Настройки пользователя
          </div>

          {/* Tabs */}
          <nav className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-1.5 rounded text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-[#1a1a1a]/50 text-foreground"
                      : "text-[#555] hover:text-foreground hover:bg-[#1a1a1a]/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="h-[1px] bg-[#1a1a1a] my-2" />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded text-sm text-[#555] hover:text-red-400 hover:bg-[#1a1a1a]/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>

        {/* User info at bottom */}
        <div className="p-2 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2 p-2 rounded bg-[#141414]/50">
            <div className="w-8 h-8 rounded-full bg-acid/20 flex items-center justify-center text-foreground text-sm font-semibold">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
              <p className="text-xs text-[#555] truncate">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#1a1a1a]">
          <h1 className="text-lg font-semibold text-foreground">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-[#555] hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[740px]">
            {activeTab === "profile" && <ProfileSettings profile={profile} />}
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "voice" && <VoiceSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "privacy" && (
              <div className="text-[#555]">
                <p>Настройки конфиденциальности скоро появятся...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
