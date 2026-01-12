"use client";

import { useState, useEffect, useRef } from "react";
import { Profile } from "@prisma/client";
import { Phone, Video, MoreVertical, SendHorizontal, Plus, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DMMessage {
  id: string;
  content: string;
  profileId: string;
  profile: Profile;
  createdAt: string;
}

interface DMChatAreaProps {
  conversationId: string;
  currentProfile: Profile;
  otherProfile: Profile;
}

export function DMChatArea({ conversationId, currentProfile, otherProfile }: DMChatAreaProps) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения
  useEffect(() => {
    fetchMessages();
    
    // Polling для обновления сообщений
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/dm/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/dm/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#313338]">
      {/* Header */}
      <div className="h-12 border-b border-zinc-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherProfile.imageUrl} />
            <AvatarFallback className="bg-indigo-500 text-white text-xs">
              {otherProfile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white text-sm">{otherProfile.name}</p>
            <p className="text-xs text-green-500">В сети</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome message */}
          <div className="text-center py-8">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={otherProfile.imageUrl} />
              <AvatarFallback className="bg-indigo-500 text-white text-2xl">
                {otherProfile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white">{otherProfile.name}</h2>
            <p className="text-zinc-400 mt-1">
              Это начало вашей беседы с {otherProfile.name}
            </p>
          </div>

          {/* Messages list */}
          {messages.map((message, index) => {
            const isOwn = message.profileId === currentProfile.id;
            const showAvatar = index === 0 || messages[index - 1]?.profileId !== message.profileId;
            
            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${showAvatar ? "mt-4" : "mt-1"}`}
              >
                {showAvatar ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={message.profile.imageUrl} />
                    <AvatarFallback className="bg-indigo-500 text-white text-xs">
                      {message.profile.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10" />
                )}
                
                <div className="flex-1">
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">
                        {message.profile.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {format(new Date(message.createdAt), "dd MMM, HH:mm", { locale: ru })}
                      </span>
                    </div>
                  )}
                  <p className="text-zinc-300">{message.content}</p>
                </div>
              </div>
            );
          })}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#383a40] rounded-lg">
          <button type="button" className="text-zinc-400 hover:text-white transition">
            <Plus className="h-6 w-6" />
          </button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Написать ${otherProfile.name}`}
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-zinc-500"
            disabled={isLoading}
          />
          
          <button type="button" className="text-zinc-400 hover:text-white transition">
            <Smile className="h-6 w-6" />
          </button>
          
          {newMessage && (
            <button
              type="submit"
              disabled={isLoading}
              className="text-indigo-500 hover:text-indigo-400 transition"
            >
              <SendHorizontal className="h-6 w-6" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
