"use client";

import { useState } from "react";
import { Profile } from "@prisma/client";
import { Camera, Save, Check, Copy, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileSettingsProps {
  profile: Profile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [imageUrl, setImageUrl] = useState(profile.imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    toast.success("ID скопирован!");
    setTimeout(() => setCopied(false), 2000);
  };

  const checkChanges = (newName: string, newBio: string, newImageUrl: string) => {
    setHasChanges(
      newName !== profile.name || 
      newBio !== (profile.bio || "") ||
      newImageUrl !== profile.imageUrl
    );
  };

  const handleNameChange = (value: string) => {
    setName(value);
    checkChanges(value, bio, imageUrl);
  };

  const handleBioChange = (value: string) => {
    setBio(value);
    checkChanges(name, value, imageUrl);
  };

  const handleAvatarChange = (url?: string) => {
    if (url) {
      setImageUrl(url);
      checkChanges(name, bio, url);
      setIsAvatarDialogOpen(false);
      toast.success("Аватар загружен! Нажмите 'Сохранить' для применения.");
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    if (name.length < 2) {
      toast.error("Имя должно быть минимум 2 символа");
      return;
    }
    
    if (name.length > 32) {
      toast.error("Имя должно быть максимум 32 символа");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, imageUrl }),
      });

      if (res.ok) {
        toast.success("Профиль сохранён!");
        setHasChanges(false);
        router.refresh();
      } else {
        const text = await res.text();
        toast.error(text || "Ошибка сохранения");
      }
    } catch (error) {
      console.error(error);
      toast.error("Не удалось сохранить профиль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="flex items-start gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24">
            <AvatarImage src={imageUrl} />
            <AvatarFallback className="bg-indigo-500 text-2xl text-white">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button 
            onClick={() => setIsAvatarDialogOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{profile.name}</h3>
          <p className="text-sm text-zinc-400 mb-3">{profile.email}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-600"
            onClick={() => setIsAvatarDialogOpen(true)}
          >
            Изменить аватар
          </Button>
        </div>
      </div>

      {/* Avatar upload dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Изменить аватар</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload
                endpoint="serverImage"
                value={imageUrl}
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-zinc-500 text-center">
              Рекомендуемый размер: 128x128 пикселей
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[1px] bg-zinc-700" />

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">Имя пользователя</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            placeholder="Ваше имя"
            maxLength={32}
          />
          <p className="text-xs text-zinc-500">{name.length}/32</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-zinc-300">О себе</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => handleBioChange(e.target.value)}
            className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Расскажите немного о себе..."
            maxLength={190}
          />
          <p className="text-xs text-zinc-500">{bio.length}/190</p>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Email</Label>
          <Input
            value={profile.email}
            disabled
            className="bg-zinc-900 border-zinc-700 text-zinc-500"
          />
          <p className="text-xs text-zinc-500">
            Email связан с вашим аккаунтом и не может быть изменён
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">ID для друзей</Label>
          <div className="flex gap-2">
            <Input
              value={profile.id}
              disabled
              className="bg-zinc-900 border-zinc-700 text-zinc-400 font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className={`shrink-0 ${copied ? "border-green-500 text-green-500" : "border-zinc-600"}`}
              onClick={handleCopyId}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Копировать
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            Отправьте этот ID другу чтобы он мог вас добавить
          </p>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Save button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !hasChanges}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </div>
  );
}
