"use client";

import { Bell, MessageCircle, AtSign, Volume2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors",
        enabled ? "bg-indigo-500" : "bg-zinc-600"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function NotificationSettings() {
  const {
    desktopNotifications,
    soundNotifications,
    mentionNotifications,
    dmNotifications,
    serverNotifications,
    notificationSounds,
    setDesktopNotifications,
    setSoundNotifications,
    setMentionNotifications,
    setDmNotifications,
    setServerNotifications,
    setNotificationSound,
  } = useSettings();

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setDesktopNotifications(true);
        toast.success("Уведомления включены!");
        
        // Show test notification
        new Notification("ECHO", {
          body: "Уведомления работают!",
          icon: "/favicon.ico",
        });
      } else {
        toast.error("Уведомления заблокированы браузером");
      }
    }
  };

  const handleDesktopNotificationsChange = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
    } else {
      setDesktopNotifications(false);
      toast.success("Уведомления отключены");
    }
  };

  const soundLabels: Record<keyof typeof notificationSounds, string> = {
    message: "Новое сообщение",
    mention: "Упоминание",
    join: "Пользователь вошёл",
    leave: "Пользователь вышел",
    call: "Входящий звонок",
    deafen: "Выкл. звук",
  };

  return (
    <div className="space-y-8">
      {/* Desktop notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Уведомления на рабочем столе</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div>
              <p className="text-white">Включить уведомления</p>
              <p className="text-sm text-zinc-500">Получать уведомления на рабочий стол</p>
            </div>
            <ToggleSwitch
              enabled={desktopNotifications}
              onChange={handleDesktopNotificationsChange}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-white">Звуковые уведомления</p>
                <p className="text-sm text-zinc-500">Воспроизводить звук при уведомлениях</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={soundNotifications}
              onChange={(enabled) => {
                setSoundNotifications(enabled);
                toast.success(enabled ? "Звук включён" : "Звук отключён");
              }}
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Message notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Уведомления о сообщениях</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <AtSign className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-white">Упоминания</p>
                <p className="text-sm text-zinc-500">Когда вас упоминают (@)</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={mentionNotifications}
              onChange={setMentionNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div>
              <p className="text-white">Личные сообщения</p>
              <p className="text-sm text-zinc-500">Сообщения в личных чатах</p>
            </div>
            <ToggleSwitch
              enabled={dmNotifications}
              onChange={setDmNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div>
              <p className="text-white">Все сообщения серверов</p>
              <p className="text-sm text-zinc-500">Все сообщения во всех каналах</p>
            </div>
            <ToggleSwitch
              enabled={serverNotifications}
              onChange={setServerNotifications}
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Notification sounds */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Звуки</h3>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(notificationSounds) as Array<keyof typeof notificationSounds>).map((sound) => (
            <div
              key={sound}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
            >
              <span className="text-sm text-white">{soundLabels[sound]}</span>
              <ToggleSwitch 
                enabled={notificationSounds[sound]} 
                onChange={(enabled) => setNotificationSound(sound, enabled)} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
