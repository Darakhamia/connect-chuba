"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { Server, Settings, Shield, Users, Zap, BarChart } from "lucide-react";

export function ServerSettingsModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "serverSettings";
  const { server } = data;

  // Form state
  const [name, setName] = useState(server?.name || "");
  const [description, setDescription] = useState(server?.description || "");
  const [imageUrl, setImageUrl] = useState(server?.imageUrl || "");
  const [bannerUrl, setBannerUrl] = useState(server?.bannerUrl || "");
  const [region, setRegion] = useState(server?.region || "auto");
  const [verificationLevel, setVerificationLevel] = useState(server?.verificationLevel || 0);
  const [explicitContentFilter, setExplicitContentFilter] = useState(server?.explicitContentFilter || 0);
  const [defaultNotifications, setDefaultNotifications] = useState(server?.defaultNotifications || 0);
  const [autoModEnabled, setAutoModEnabled] = useState(server?.autoModEnabled || false);
  const [antiSpamEnabled, setAntiSpamEnabled] = useState(server?.antiSpamEnabled || false);
  const [antiRaidEnabled, setAntiRaidEnabled] = useState(server?.antiRaidEnabled || false);
  const [filterWords, setFilterWords] = useState(server?.filterWords?.join(", ") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!server) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/servers/${server.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
          bannerUrl,
          region,
          verificationLevel: parseInt(verificationLevel.toString()),
          explicitContentFilter: parseInt(explicitContentFilter.toString()),
          defaultNotifications: parseInt(defaultNotifications.toString()),
          autoModEnabled,
          antiSpamEnabled,
          antiRaidEnabled,
          filterWords: filterWords.split(",").map(w => w.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        toast.success("Настройки сервера обновлены!");
        router.refresh();
        onClose();
      } else {
        toast.error("Ошибка при обновлении настроек");
      }
    } catch (error) {
      console.error("Error updating server settings:", error);
      toast.error("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Настройки сервера
          </DialogTitle>
          <DialogDescription>
            Настройте параметры вашего сервера
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Server className="w-4 h-4 mr-2" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="moderation">
                <Shield className="w-4 h-4 mr-2" />
                Модерация
              </TabsTrigger>
              <TabsTrigger value="community">
                <Users className="w-4 h-4 mr-2" />
                Сообщество
              </TabsTrigger>
              <TabsTrigger value="features">
                <Zap className="w-4 h-4 mr-2" />
                Фичи
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-2">
                <Label>Название сервера</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Мой крутой сервер"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите о вашем сервере..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Иконка сервера</Label>
                <FileUpload
                  endpoint="serverImage"
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url || "")}
                />
              </div>

              <div className="space-y-2">
                <Label>Баннер сервера</Label>
                <FileUpload
                  endpoint="serverImage"
                  value={bannerUrl}
                  onChange={(url) => setBannerUrl(url || "")}
                />
              </div>

              <div className="space-y-2">
                <Label>Регион сервера</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🌍 Автоматически</SelectItem>
                    <SelectItem value="russia">🇷🇺 Россия</SelectItem>
                    <SelectItem value="europe">🇪🇺 Европа</SelectItem>
                    <SelectItem value="us-east">🇺🇸 США Восток</SelectItem>
                    <SelectItem value="us-west">🇺🇸 США Запад</SelectItem>
                    <SelectItem value="asia">🌏 Азия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation" className="space-y-4">
              <div className="space-y-2">
                <Label>Уровень верификации</Label>
                <Select 
                  value={verificationLevel.toString()} 
                  onValueChange={(v) => setVerificationLevel(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Нет - Без ограничений</SelectItem>
                    <SelectItem value="1">Низкий - Подтвержденный email</SelectItem>
                    <SelectItem value="2">Средний - 5 минут на сервере</SelectItem>
                    <SelectItem value="3">Высокий - 10 минут на сервере</SelectItem>
                    <SelectItem value="4">Максимальный - Подтвержденный телефон</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Фильтр контента</Label>
                <Select 
                  value={explicitContentFilter.toString()} 
                  onValueChange={(v) => setExplicitContentFilter(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Отключен</SelectItem>
                    <SelectItem value="1">Участники без ролей</SelectItem>
                    <SelectItem value="2">Все участники</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Автомодерация</Label>
                  <p className="text-sm text-muted-foreground">
                    Автоматическая фильтрация нежелательного контента
                  </p>
                </div>
                <Switch
                  checked={autoModEnabled}
                  onCheckedChange={setAutoModEnabled}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Защита от спама</Label>
                  <p className="text-sm text-muted-foreground">
                    Автоматическое обнаружение спама
                  </p>
                </div>
                <Switch
                  checked={antiSpamEnabled}
                  onCheckedChange={setAntiSpamEnabled}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Защита от рейдов</Label>
                  <p className="text-sm text-muted-foreground">
                    Защита от массовых вступлений
                  </p>
                </div>
                <Switch
                  checked={antiRaidEnabled}
                  onCheckedChange={setAntiRaidEnabled}
                  disabled={isLoading}
                />
              </div>

              {autoModEnabled && (
                <div className="space-y-2">
                  <Label>Запрещенные слова</Label>
                  <Textarea
                    value={filterWords}
                    onChange={(e) => setFilterWords(e.target.value)}
                    placeholder="слово1, слово2, слово3..."
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Разделяйте слова запятыми
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-4">
              <div className="space-y-2">
                <Label>Уведомления по умолчанию</Label>
                <Select 
                  value={defaultNotifications.toString()} 
                  onValueChange={(v) => setDefaultNotifications(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Все сообщения</SelectItem>
                    <SelectItem value="1">Только упоминания</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Код приглашения</Label>
                <Input value={server?.inviteCode || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Ссылка для приглашения: {window.location.origin}/invite/{server?.inviteCode}
                </p>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Статистика сервера</h4>
                  <p className="text-sm text-muted-foreground">
                    Участников: {server?.members?.length || 0}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Дополнительные функции появятся в следующих обновлениях:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Webhooks для интеграций</li>
                  <li>Vanity URL (кастомная ссылка)</li>
                  <li>Server Boost функции</li>
                  <li>Расширенная аналитика</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
