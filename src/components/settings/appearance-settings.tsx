"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const themes = [
  { id: "light" as const, label: "Светлая", icon: Sun, preview: "bg-white" },
  { id: "dark" as const, label: "Тёмная", icon: Moon, preview: "bg-zinc-900" },
  { id: "system" as const, label: "Системная", icon: Monitor, preview: "bg-gradient-to-r from-white to-zinc-900" },
];

const accentColors = [
  { id: "indigo", color: "#5865f2", label: "Индиго" },
  { id: "green", color: "#3ba55c", label: "Зелёный" },
  { id: "yellow", color: "#faa61a", label: "Жёлтый" },
  { id: "red", color: "#ed4245", label: "Красный" },
  { id: "pink", color: "#eb459e", label: "Розовый" },
  { id: "purple", color: "#9b59b6", label: "Фиолетовый" },
  { id: "cyan", color: "#00aff4", label: "Голубой" },
  { id: "orange", color: "#e67e22", label: "Оранжевый" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Theme selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Тема</h3>
          <p className="text-sm text-zinc-400">Выберите тему оформления для ECHO</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  isActive
                    ? "border-indigo-500 bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                )}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className={cn("w-full h-16 rounded-md mb-3", t.preview)} />
                
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-white">{t.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Accent color */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Акцентный цвет</h3>
          <p className="text-sm text-zinc-400">Выберите основной цвет интерфейса</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              className="group relative"
              title={color.label}
            >
              <div
                className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-white/30 transition-all"
                style={{ backgroundColor: color.color }}
              />
              {color.id === "indigo" && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-indigo-500" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <p className="text-xs text-zinc-500">
          Кастомные цвета скоро будут доступны
        </p>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Font size */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Размер текста</h3>
          <p className="text-sm text-zinc-400">Настройте размер текста в чате</p>
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-zinc-400 text-sm">A</Label>
          <input
            type="range"
            min="12"
            max="20"
            defaultValue="14"
            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <Label className="text-zinc-400 text-lg">A</Label>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Message display */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Отображение сообщений</h3>
          <p className="text-sm text-zinc-400">Выберите стиль отображения сообщений</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 rounded-lg border-2 border-indigo-500 bg-zinc-800">
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-600" />
                <div className="flex-1">
                  <div className="h-3 w-20 bg-zinc-600 rounded mb-1" />
                  <div className="h-2 w-32 bg-zinc-700 rounded" />
                </div>
              </div>
            </div>
            <span className="text-sm text-white">Компактный</span>
          </button>
          
          <button className="p-4 rounded-lg border-2 border-zinc-700 bg-zinc-800/50 hover:border-zinc-600">
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-600" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-zinc-600 rounded mb-2" />
                  <div className="h-2 w-full bg-zinc-700 rounded mb-1" />
                  <div className="h-2 w-3/4 bg-zinc-700 rounded" />
                </div>
              </div>
            </div>
            <span className="text-sm text-white">Удобный</span>
          </button>
        </div>
      </div>
    </div>
  );
}
