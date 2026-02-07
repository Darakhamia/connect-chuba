"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import { UserPlus, Users, Clock, Check, X, MessageCircle, Phone, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tab = "online" | "all" | "pending" | "add";

interface FriendWithProfile extends Profile {
  friendshipId: string;
}

interface FriendRequest {
  id: string;
  sender?: Profile;
  receiver?: Profile;
  createdAt: string;
}

export function FriendsList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("online");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addFriendId, setAddFriendId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Начать чат с другом
  const startChat = async (friendId: string) => {
    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: friendId }),
      });

      if (res.ok) {
        const conversation = await res.json();
        router.push(`/dm/${conversation.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Позвонить другу (пока заглушка)
  const startCall = async (friendId: string) => {
    alert("Звонки в разработке! Скоро будет доступно.");
  };

  // Загрузка друзей
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch("/api/friends/requests?type=incoming"),
        fetch("/api/friends/requests?type=outgoing"),
      ]);

      if (incomingRes.ok) {
        setIncomingRequests(await incomingRes.json());
      }
      if (outgoingRes.ok) {
        setOutgoingRequests(await outgoingRes.json());
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleAddFriend = async () => {
    if (!addFriendId.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oderId: addFriendId.trim() }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Запрос отправлен!" });
        setAddFriendId("");
        fetchRequests();
      } else {
        const text = await res.text();
        setMessage({ type: "error", text: text || "Не удалось отправить запрос" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка подключения" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (res.ok) {
        fetchFriends();
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Пока все друзья считаются онлайн
  const onlineFriends = filteredFriends;

  const tabs = [
    { id: "online" as const, label: "В сети", count: onlineFriends.length },
    { id: "all" as const, label: "Все", count: friends.length },
    { id: "pending" as const, label: "Ожидание", count: incomingRequests.length + outgoingRequests.length },
    { id: "add" as const, label: "Добавить друга", isGreen: true },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-4">
        <Users className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold text-foreground">Друзья</span>
        
        <div className="h-6 w-[1px] bg-secondary mx-2" />
        
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-2 py-1 rounded text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? tab.isGreen
                    ? "bg-primary/20 text-foreground"
                    : "bg-secondary text-foreground"
                  : tab.isGreen
                    ? "text-primary hover:bg-secondary/50"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 text-xs">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Add Friend Tab */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <h2 className="text-xl font-bold text-foreground mb-2">Добавить друга</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Введите ID пользователя ECHO чтобы отправить запрос в друзья.
            </p>

            <div className="flex gap-2">
              <Input
                value={addFriendId}
                onChange={(e) => setAddFriendId(e.target.value)}
                placeholder="Введите ID пользователя"
                className="bg-card border-border text-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              />
              <Button
                onClick={handleAddFriend}
                disabled={isLoading || !addFriendId.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </div>

            {message && (
              <p className={cn(
                "mt-3 text-sm",
                message.type === "success" ? "text-primary" : "text-destructive"
              )}>
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Входящие — {incomingRequests.length}
                </h3>
                <div className="space-y-1">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-card/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.sender?.imageUrl} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {request.sender?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{request.sender?.name}</p>
                          <p className="text-xs text-muted-foreground">Входящий запрос</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="h-9 w-9 rounded-full bg-secondary hover:bg-primary/20"
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="h-9 w-9 rounded-full bg-secondary hover:bg-destructive/30"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing requests */}
            {outgoingRequests.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Исходящие — {outgoingRequests.length}
                </h3>
                <div className="space-y-1">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-card/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.receiver?.imageUrl} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {request.receiver?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{request.receiver?.name}</p>
                          <p className="text-xs text-muted-foreground">Исходящий запрос</p>
                        </div>
                      </div>
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет ожидающих запросов</p>
              </div>
            )}
          </div>
        )}

        {/* Friends List (Online / All) */}
        {(activeTab === "online" || activeTab === "all") && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="pl-9 bg-card border-border text-foreground"
              />
            </div>

            {/* Friends list */}
            <div className="space-y-1">
              {(activeTab === "online" ? onlineFriends : filteredFriends).map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-card/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.imageUrl} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-secondary bg-discord-green" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">
                        В сети
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startChat(friend.id)}
                      className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startCall(friend.id)}
                      className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-border">
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Удалить из друзей
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {(activeTab === "online" ? onlineFriends : filteredFriends).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {activeTab === "online"
                      ? "Никого нет в сети"
                      : friends.length === 0
                        ? "У вас пока нет друзей"
                        : "Никого не найдено"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
