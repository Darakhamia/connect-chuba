"use client";

import { useSettings } from "@/hooks/use-settings-store";
import { themes, getThemeById } from "@/components/providers/appearance-provider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AppearanceSettings() {
  const {
    theme,
    setThemeId,
    fontSize,
    setFontSize,
    messageDisplay,
    setMessageDisplay
  } = useSettings();

  const currentTheme = getThemeById(theme);

  const handleThemeChange = (themeId: string) => {
    setThemeId(themeId);
    const t = themes.find(t => t.id === themeId);
    toast.success(`Тема: ${t?.name}`);
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
          <h3 className="text-lg font-semibold text-foreground mb-1">Тема интерфейса</h3>
          <p className="text-sm text-muted-foreground">Выберите тему — она изменит весь интерфейс</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themes.map((t) => {
            const isActive = theme === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  "relative rounded-lg border-2 transition-all overflow-hidden group",
                  isActive
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {/* Theme preview — mini mockup */}
                <div className="h-20 flex">
                  {/* Sidebar preview */}
                  <div
                    className="w-1/4 flex flex-col items-center pt-2 gap-1"
                    style={{ backgroundColor: t.preview.sidebar }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                    <div
                      className="w-4 h-4 rounded-full opacity-30"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                    <div
                      className="w-4 h-4 rounded-full opacity-15"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                  </div>
                  {/* Main area preview */}
                  <div
                    className="flex-1 p-2 flex flex-col gap-1.5"
                    style={{ backgroundColor: t.preview.main }}
                  >
                    {/* Fake message lines */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.6 }}
                      />
                      <div
                        className="h-1.5 rounded-full flex-1"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.15 }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.4 }}
                      />
                      <div
                        className="h-1.5 rounded-full w-3/4"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.1 }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.5 }}
                      />
                      <div
                        className="h-1.5 rounded-full w-1/2"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.12 }}
                      />
                    </div>
                    {/* Fake input */}
                    <div className="mt-auto">
                      <div
                        className="h-2 rounded-sm"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.08 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div
                  className="px-3 py-2 text-left"
                  style={{ backgroundColor: t.preview.sidebar }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: isActive ? t.preview.accent : "#999" }}
                      >
                        {t.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "#555" }}>
                        {t.description}
                      </p>
                    </div>
                    {isActive && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: t.preview.accent }}
                      >
                        <Check className="w-3 h-3" style={{ color: t.preview.sidebar }} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-border" />

      {/* Font size */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Размер текста</h3>
          <p className="text-sm text-muted-foreground">Размер текста в чате ({fontSize}px)</p>
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-muted-foreground text-sm">A</Label>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: currentTheme.preview.accent }}
          />
          <Label className="text-muted-foreground text-lg">A</Label>
        </div>

        {/* Preview */}
        <div className="p-4 bg-card rounded-lg">
          <p className="text-muted-foreground text-xs mb-2">Предпросмотр:</p>
          <p className="text-foreground" style={{ fontSize: `${fontSize}px` }}>
            Привет! Это пример сообщения в чате.
          </p>
        </div>
      </div>

      <div className="h-[1px] bg-border" />

      {/* Message display */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Отображение сообщений</h3>
          <p className="text-sm text-muted-foreground">Стиль отображения сообщений</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleMessageDisplayChange("compact")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              messageDisplay === "compact"
                ? "border-primary bg-card"
                : "border-border bg-card/50 hover:border-muted-foreground/30"
            )}
          >
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary" />
                <div className="flex-1">
                  <div className="h-2.5 w-16 bg-secondary rounded mb-1" />
                  <div className="h-2 w-24 bg-border rounded" />
                </div>
              </div>
            </div>
            <span className="text-sm text-foreground">Компактный</span>
          </button>

          <button
            onClick={() => handleMessageDisplayChange("cozy")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              messageDisplay === "cozy"
                ? "border-primary bg-card"
                : "border-border bg-card/50 hover:border-muted-foreground/30"
            )}
          >
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="flex-1">
                  <div className="h-3 w-20 bg-secondary rounded mb-2" />
                  <div className="h-2 w-full bg-border rounded mb-1" />
                  <div className="h-2 w-3/4 bg-border rounded" />
                </div>
              </div>
            </div>
            <span className="text-sm text-foreground">Удобный</span>
          </button>
        </div>
      </div>
    </div>
  );
}
