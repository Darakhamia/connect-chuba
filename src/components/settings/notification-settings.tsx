"use client";

import { useState } from "react";
import { Bell, MessageCircle, AtSign, Volume2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [dmNotifications, setDmNotifications] = useState(true);
  const [serverNotifications, setServerNotifications] = useState(false);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setDesktopNotifications(true);
      }
    }
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
              onChange={(enabled) => {
                if (enabled) {
                  requestNotificationPermission();
                } else {
                  setDesktopNotifications(false);
                }
              }}
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
              onChange={setSoundNotifications}
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
          {[
            { id: "message", label: "Новое сообщение" },
            { id: "mention", label: "Упоминание" },
            { id: "join", label: "Пользователь вошёл" },
            { id: "leave", label: "Пользователь вышел" },
            { id: "call", label: "Входящий звонок" },
            { id: "deafen", label: "Выкл. звук" },
          ].map((sound) => (
            <div
              key={sound.id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
            >
              <span className="text-sm text-white">{sound.label}</span>
              <ToggleSwitch enabled={true} onChange={() => {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
