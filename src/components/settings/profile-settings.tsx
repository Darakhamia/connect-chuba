"use client";

import { useState } from "react";
import { Profile } from "@prisma/client";
import { Camera, Save, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSettingsProps {
  profile: Profile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement profile update API
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
    } catch (error) {
      console.error(error);
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
            <AvatarImage src={profile.imageUrl} />
            <AvatarFallback className="bg-indigo-500 text-2xl text-white">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{profile.name}</h3>
          <p className="text-sm text-zinc-400 mb-3">{profile.email}</p>
          <Button variant="outline" size="sm" className="border-zinc-600">
            Изменить аватар
          </Button>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">Имя пользователя</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            placeholder="Ваше имя"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-zinc-300">О себе</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Расскажите немного о себе..."
          />
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
          disabled={isLoading}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}
