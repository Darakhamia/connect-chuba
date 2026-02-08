"use client";

import { useRouter } from "next/navigation";
import { MemberRole } from "@prisma/client";
import { ShieldAlert, ShieldCheck, MessageSquare, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileMember {
  id: string;
  role: MemberRole;
  profile: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
  };
}

interface UserProfileCardProps {
  member: ProfileMember;
  serverId: string;
  onClose: () => void;
}

const roleLabelMap: Record<string, string> = {
  ADMIN: "Администратор",
  MODERATOR: "Модератор",
  GUEST: "Участник",
};

const roleColorMap: Record<string, string> = {
  ADMIN: "text-rose-500",
  MODERATOR: "text-primary",
  GUEST: "text-muted-foreground",
};

export function UserProfileCard({ member, serverId, onClose }: UserProfileCardProps) {
  const router = useRouter();

  const handleMessage = () => {
    router.push(`/servers/${serverId}/conversations/${member.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-card rounded-lg shadow-xl w-[340px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner area */}
        <div className="h-16 bg-primary/30 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded hover:bg-black/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-10">
          <Avatar className="h-20 w-20 border-4 border-card">
            <AvatarImage src={member.profile.imageUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {member.profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">
              {member.profile.name}
            </h3>
            {member.role === MemberRole.ADMIN && (
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            )}
            {member.role === MemberRole.MODERATOR && (
              <ShieldCheck className="h-4 w-4 text-primary" />
            )}
          </div>
          <p className={`text-xs font-medium ${roleColorMap[member.role]}`}>
            {roleLabelMap[member.role]}
          </p>

          <div className="mt-3 pt-3 border-t border-border">
            <Button
              onClick={handleMessage}
              variant="secondary"
              size="sm"
              className="w-full gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Написать сообщение
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
