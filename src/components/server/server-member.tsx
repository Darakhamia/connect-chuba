"use client";

import { useParams, useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

export function ServerMember({ member, server }: ServerMemberProps) {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${server.id}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-sidebar-accent transition mb-1",
        params?.memberId === member.id && "bg-sidebar-accent"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={member.profile.imageUrl} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {member.profile.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <p
        className={cn(
          "font-semibold text-sm text-muted-foreground group-hover:text-foreground transition",
          params?.memberId === member.id && "text-foreground"
        )}
      >
        {member.profile.name}
      </p>
      
      {icon}
    </button>
  );
}

