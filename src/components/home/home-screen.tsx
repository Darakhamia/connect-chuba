"use client";

import { Profile } from "@prisma/client";
import { MessageCircle } from "lucide-react";
import { FriendsList } from "@/components/friends/friends-list";
import { DMSidebar } from "@/components/dm/dm-sidebar";

interface HomeScreenProps {
  profile: Profile;
  hasServers: boolean;
}

export function HomeScreen({ profile, hasServers }: HomeScreenProps) {
  return (
    <div className="h-full flex">
      {/* DM Sidebar */}
      <DMSidebar profile={profile} />

      {/* Main content - Friends */}
      <div className="flex-1 bg-chat-area flex flex-col">
        <FriendsList />
      </div>
    </div>
  );
}
