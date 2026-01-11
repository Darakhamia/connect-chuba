"use client";

import { useState } from "react";
import { 
  Hash, 
  Bell, 
  Pin, 
  Users, 
  Search, 
  Inbox, 
  HelpCircle,
  PlusCircle,
  Gift,
  Sticker,
  Smile,
  SendHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

// Mock data
const mockChannel = {
  id: "ch3",
  name: "общий-чат",
  type: "TEXT" as const,
};

const mockMessages = [
  {
    id: "msg1",
    content: "Привет всем! Как дела?",
    authorId: "user1",
    authorName: "Игрок123",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isFirstInGroup: true,
  },
  {
    id: "msg2",
    content: "Кто-нибудь хочет поиграть сегодня вечером?",
    authorId: "user1",
    authorName: "Игрок123",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60), // 2 hours - 1 min ago
    isFirstInGroup: false,
  },
  {
    id: "msg3",
    content: "Привет! Да, я в деле 🎮",
    authorId: "user2",
    authorName: "ProGamer",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    isFirstInGroup: true,
  },
  {
    id: "msg4",
    content: "Во сколько планируете начать?",
    authorId: "user3",
    authorName: "Новичок",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    isFirstInGroup: true,
  },
  {
    id: "msg5",
    content: "Давайте в 8 вечера, устроит всех?",
    authorId: "user1",
    authorName: "Игрок123",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
    isFirstInGroup: true,
  },
  {
    id: "msg6",
    content: "Отлично, буду!",
    authorId: "user2",
    authorName: "ProGamer",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    isFirstInGroup: true,
  },
  {
    id: "msg7",
    content: "+1",
    authorId: "user3",
    authorName: "Новичок",
    authorAvatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 min ago
    isFirstInGroup: true,
  },
];

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? "Только что" : `${diffMins} мин. назад`;
  }
  
  if (diffHours < 24) {
    return `Сегодня в ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  
  return date.toLocaleDateString("ru-RU", { 
    day: "numeric", 
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });
}

interface MessageProps {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  timestamp: Date;
  isFirstInGroup: boolean;
}

function Message({ content, authorName, authorAvatar, timestamp, isFirstInGroup }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group px-4 py-0.5 hover:bg-foreground/5",
        isFirstInGroup && "mt-4 pt-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        {/* Avatar - показываем только для первого сообщения в группе */}
        {isFirstInGroup ? (
          <Avatar className="w-10 h-10 mt-0.5 cursor-pointer hover:opacity-80">
            <AvatarImage src={authorAvatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {authorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 flex items-center justify-center">
            {isHovered && (
              <span className="text-[10px] text-muted-foreground">
                {timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Header - показываем только для первого сообщения в группе */}
          {isFirstInGroup && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-semibold text-foreground hover:underline cursor-pointer">
                {authorName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </span>
            </div>
          )}

          {/* Content */}
          <p className="text-foreground break-words">{content}</p>
        </div>
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border bg-chat-area shadow-sm">
      {/* Left side - Channel info */}
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold">{mockChannel.name}</h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Уведомления</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Pin className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Закреплённые сообщения</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Users className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Список участников</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Search */}
        <div className="relative">
          <Input 
            placeholder="Поиск" 
            className="w-40 h-6 text-xs bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Inbox className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Входящие</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Справка</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function ChatInput() {
  const [message, setMessage] = useState("");

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-chat-input rounded-lg">
        {/* Attachment button */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <PlusCircle className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Прикрепить файл</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Написать в #${mockChannel.name}`}
          className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Gift className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Отправить подарок</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Sticker className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Выбрать стикер</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Smile className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Выбрать эмодзи</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {message && (
            <button className="text-primary hover:text-primary/80">
              <SendHorizontal className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatArea() {
  return (
    <div className="flex flex-col h-full bg-chat-area">
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {/* Welcome message */}
          <div className="px-4 py-6 mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex-center mb-4">
              <Hash className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Добро пожаловать в #{mockChannel.name}!</h1>
            <p className="text-muted-foreground">
              Это начало канала #{mockChannel.name}.
            </p>
          </div>

          {/* Messages list */}
          {mockMessages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput />
    </div>
  );
}

