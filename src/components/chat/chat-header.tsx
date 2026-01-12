"use client";

import { useState } from "react";
import { Hash, Search, Pin, Music2 } from "lucide-react";
import { MobileToggle } from "@/components/mobile-toggle";
import { SocketIndicator } from "@/components/socket-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatHeaderProps {
  serverId?: string;
  channelId?: string;
  conversationId?: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
  onMusicClick?: () => void;
}

export function ChatHeader({ serverId, channelId, conversationId, name, type, imageUrl, onMusicClick }: ChatHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const url = type === "channel" 
        ? `/api/channels/${channelId}/search?q=${encodeURIComponent(searchQuery)}`
        : `/api/dm/${conversationId}/search?q=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowPinned = async () => {
    if (type !== "channel" || !channelId) return;
    
    try {
      const res = await fetch(`/api/channels/${channelId}/pinned`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Pinned messages error:", error);
    }
  };

  return (
    <div className="text-md font-semibold px-3 flex items-center h-12 border-b border-border">
      <MobileToggle serverId={serverId} />
      
      {type === "channel" && (
        <Hash className="w-5 h-5 text-muted-foreground mr-2" />
      )}
      
      {type === "conversation" && imageUrl && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={imageUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <p className="font-semibold text-md">{name}</p>
      
      <div className="ml-auto flex items-center gap-2">
        {/* Music (only for voice channels) */}
        {type === "channel" && onMusicClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMusicClick}
            className="h-8 w-8"
            title="Music"
          >
            <Music2 className="h-4 w-4" />
          </Button>
        )}

        {/* Закрепленные сообщения */}
        {type === "channel" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShowPinned}
            className="h-8 w-8"
            title="Закрепленные"
          >
            <Pin className="h-4 w-4" />
          </Button>
        )}

        {/* Поиск */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Поиск">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-popover border-border">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Поиск сообщений</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Введите запрос..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-input border-border text-foreground"
                />
                <Button onClick={handleSearch} disabled={isSearching} size="sm">
                  {isSearching ? "..." : "Найти"}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((msg: any) => (
                    <div key={msg.id} className="p-2 bg-secondary rounded text-sm">
                      <p className="font-semibold text-foreground">
                        {msg.member?.profile?.name || msg.profile?.name}
                      </p>
                      <p className="text-muted-foreground">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <SocketIndicator />
      </div>
    </div>
  );
}
