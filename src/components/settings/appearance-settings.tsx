"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { useSettings } from "@/hooks/use-settings-store";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

const backgroundThemes = [
  { id: "dark", label: "Тёмная", preview: "#313338", description: "Стандартная тёмная тема" },
  { id: "darker", label: "Темнее", preview: "#1a1a1d", description: "Более тёмные оттенки" },
  { id: "midnight", label: "Полночь", preview: "#0e1525", description: "Синеватые тона" },
  { id: "amoled", label: "AMOLED", preview: "#000000", description: "Чистый чёрный" },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { 
    accentColor, 
    setAccentColor, 
    backgroundColor,
    setBackgroundColor,
    fontSize, 
    setFontSize,
    messageDisplay,
    setMessageDisplay
  } = useSettings();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast.success(`Тема: ${themes.find(t => t.id === newTheme)?.label}`);
  };

  const handleAccentChange = (colorId: string) => {
    setAccentColor(colorId);
    const color = accentColors.find(c => c.id === colorId);
    toast.success(`Акцент: ${color?.label}`);
  };

  const handleBackgroundChange = (bgId: string) => {
    setBackgroundColor(bgId);
    const bg = backgroundThemes.find(b => b.id === bgId);
    toast.success(`Фон: ${bg?.label}`);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const handleMessageDisplayChange = (display: "compact" | "cozy") => {
    setMessageDisplay(display);
    toast.success(display === "compact" ? "Компактный режим" : "Удобный режим");
  };

  return (
    <div className="space-y-8">
      {/* Theme selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Режим</h3>
          <p className="text-sm text-zinc-400">Светлая или тёмная тема</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  isActive
                    ? "border-primary bg-zinc-800"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                )}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className={cn("w-full h-12 rounded-md mb-3", t.preview)} />
                
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

      {/* Background theme */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Фоновая тема</h3>
          <p className="text-sm text-zinc-400">Выберите оттенки фона интерфейса</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {backgroundThemes.map((bg) => (
            <button
              key={bg.id}
              onClick={() => handleBackgroundChange(bg.id)}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all text-left",
                backgroundColor === bg.id
                  ? "border-primary bg-zinc-800"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
              )}
            >
              {backgroundColor === bg.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              
              <div 
                className="w-full h-8 rounded mb-2 border border-zinc-600"
                style={{ backgroundColor: bg.preview }}
              />
              <p className="text-sm font-medium text-white">{bg.label}</p>
              <p className="text-xs text-zinc-500">{bg.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Accent color */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Акцентный цвет</h3>
          <p className="text-sm text-zinc-400">Основной цвет кнопок и выделений</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAccentChange(color.id)}
              className="group relative"
              title={color.label}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full ring-2 transition-all",
                  accentColor === color.id 
                    ? "ring-white ring-offset-2 ring-offset-zinc-900" 
                    : "ring-transparent group-hover:ring-white/30"
                )}
                style={{ backgroundColor: color.color }}
              />
              {accentColor === color.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <Check className="w-3 h-3" style={{ color: color.color }} />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Preview */}
        <div className="p-4 bg-zinc-800 rounded-lg space-y-3">
          <p className="text-sm text-zinc-400">Предпросмотр акцента:</p>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: accentColors.find(c => c.id === accentColor)?.color }}
            >
              Кнопка
            </button>
            <div 
              className="px-3 py-1 rounded text-white text-sm"
              style={{ backgroundColor: `${accentColors.find(c => c.id === accentColor)?.color}33` }}
            >
              Выделение
            </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Font size */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Размер текста</h3>
          <p className="text-sm text-zinc-400">Размер текста в чате ({fontSize}px)</p>
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-zinc-400 text-sm">A</Label>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: accentColors.find(c => c.id === accentColor)?.color }}
          />
          <Label className="text-zinc-400 text-lg">A</Label>
        </div>

        {/* Preview */}
        <div className="p-4 bg-zinc-800 rounded-lg">
          <p className="text-zinc-400 text-xs mb-2">Предпросмотр:</p>
          <p className="text-white" style={{ fontSize: `${fontSize}px` }}>
            Привет! Это пример сообщения в чате.
          </p>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Message display */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Отображение сообщений</h3>
          <p className="text-sm text-zinc-400">Стиль отображения сообщений</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleMessageDisplayChange("compact")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              messageDisplay === "compact"
                ? "border-primary bg-zinc-800"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            )}
          >
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-600" />
                <div className="flex-1">
                  <div className="h-2.5 w-16 bg-zinc-600 rounded mb-1" />
                  <div className="h-2 w-24 bg-zinc-700 rounded" />
                </div>
              </div>
            </div>
            <span className="text-sm text-white">Компактный</span>
          </button>
          
          <button 
            onClick={() => handleMessageDisplayChange("cozy")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              messageDisplay === "cozy"
                ? "border-primary bg-zinc-800"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            )}
          >
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-600" />
                <div className="flex-1">
                  <div className="h-3 w-20 bg-zinc-600 rounded mb-2" />
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
