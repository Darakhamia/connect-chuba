import { Hash } from "lucide-react";
import { MobileToggle } from "@/components/mobile-toggle";
import { SocketIndicator } from "@/components/socket-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

export async function ChatHeader({ serverId, name, type, imageUrl }: ChatHeaderProps) {
  return (
    <div className="text-md font-semibold px-3 flex items-center h-12 border-b border-border">
      <MobileToggle 
        navigationSidebar={<NavigationSidebar />}
        serverSidebar={<ServerSidebar serverId={serverId} />}
      />
      
      {type === "channel" && (
        <Hash className="w-5 h-5 text-muted-foreground mr-2" />
      )}
      
      {type === "conversation" && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={imageUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <p className="font-semibold text-md">{name}</p>
      
      <div className="ml-auto flex items-center">
        <SocketIndicator />
      </div>
    </div>
  );
}
