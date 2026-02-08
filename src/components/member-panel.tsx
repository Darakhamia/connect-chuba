"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MemberRole } from "@prisma/client";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfileCard } from "@/components/user-profile-card";

interface MemberInfo {
  id: string;
  role: MemberRole;
  profile: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
  };
}

interface MemberPanelProps {
  serverId: string;
  onClose: () => void;
}

const roleIconMap: Record<string, React.ReactNode> = {
  ADMIN: <ShieldAlert className="h-3 w-3 text-rose-500" />,
  MODERATOR: <ShieldCheck className="h-3 w-3 text-primary" />,
  GUEST: null,
};

export function MemberPanel({ serverId, onClose }: MemberPanelProps) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {}
  }, [serverId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const admins = members.filter((m) => m.role === MemberRole.ADMIN);
  const moderators = members.filter((m) => m.role === MemberRole.MODERATOR);
  const guests = members.filter((m) => m.role === MemberRole.GUEST);

  const renderSection = (title: string, list: MemberInfo[]) => {
    if (!list.length) return null;
    return (
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">
          {title} — {list.length}
        </p>
        {list.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.profile.imageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {member.profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground truncate">
              {member.profile.name}
            </span>
            {roleIconMap[member.role]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-60 border-l border-border bg-channel-sidebar flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between px-3 h-12 border-b border-border">
        <span className="text-sm font-semibold">Участники</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <ScrollArea className="flex-1 p-2">
        {renderSection("Администраторы", admins)}
        {renderSection("Модераторы", moderators)}
        {renderSection("Участники", guests)}
      </ScrollArea>

      {selectedMember && (
        <UserProfileCard
          member={selectedMember}
          serverId={serverId}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
