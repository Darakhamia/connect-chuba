"use client";

import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<Tab>("online");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addFriendId, setAddFriendId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const onlineFriends = filteredFriends.filter((f) => f.status === "ONLINE");

  const tabs = [
    { id: "online" as const, label: "В сети", count: onlineFriends.length },
    { id: "all" as const, label: "Все", count: friends.length },
    { id: "pending" as const, label: "Ожидание", count: incomingRequests.length + outgoingRequests.length },
    { id: "add" as const, label: "Добавить друга", isGreen: true },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-zinc-700 flex items-center px-4 gap-4">
        <Users className="w-5 h-5 text-zinc-400" />
        <span className="font-semibold text-white">Друзья</span>
        
        <div className="h-6 w-[1px] bg-zinc-700 mx-2" />
        
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
                    ? "bg-green-600 text-white"
                    : "bg-zinc-700 text-white"
                  : tab.isGreen
                    ? "text-green-500 hover:bg-zinc-700/50"
                    : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"
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
            <h2 className="text-xl font-bold text-white mb-2">Добавить друга</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Введите ID пользователя ECHO чтобы отправить запрос в друзья.
            </p>

            <div className="flex gap-2">
              <Input
                value={addFriendId}
                onChange={(e) => setAddFriendId(e.target.value)}
                placeholder="Введите ID пользователя"
                className="bg-zinc-900 border-zinc-700 text-white"
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              />
              <Button
                onClick={handleAddFriend}
                disabled={isLoading || !addFriendId.trim()}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </div>

            {message && (
              <p className={cn(
                "mt-3 text-sm",
                message.type === "success" ? "text-green-500" : "text-red-500"
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
                <h3 className="text-xs font-semibold text-zinc-400 uppercase mb-2">
                  Входящие — {incomingRequests.length}
                </h3>
                <div className="space-y-1">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.sender?.imageUrl} />
                          <AvatarFallback className="bg-indigo-500">
                            {request.sender?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{request.sender?.name}</p>
                          <p className="text-xs text-zinc-400">Входящий запрос</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-green-600"
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-red-600"
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
                <h3 className="text-xs font-semibold text-zinc-400 uppercase mb-2">
                  Исходящие — {outgoingRequests.length}
                </h3>
                <div className="space-y-1">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.receiver?.imageUrl} />
                          <AvatarFallback className="bg-indigo-500">
                            {request.receiver?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{request.receiver?.name}</p>
                          <p className="text-xs text-zinc-400">Исходящий запрос</p>
                        </div>
                      </div>
                      <Clock className="w-5 h-5 text-zinc-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
                className="pl-9 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            {/* Friends list */}
            <div className="space-y-1">
              {(activeTab === "online" ? onlineFriends : filteredFriends).map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.imageUrl} />
                        <AvatarFallback className="bg-indigo-500">
                          {friend.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-800",
                          friend.status === "ONLINE" ? "bg-green-500" :
                          friend.status === "IDLE" ? "bg-yellow-500" :
                          friend.status === "DND" ? "bg-red-500" : "bg-zinc-500"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">{friend.name}</p>
                      <p className="text-xs text-zinc-400">
                        {friend.status === "ONLINE" ? "В сети" :
                         friend.status === "IDLE" ? "Не активен" :
                         friend.status === "DND" ? "Не беспокоить" : "Не в сети"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                          Удалить из друзей
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {(activeTab === "online" ? onlineFriends : filteredFriends).length === 0 && (
                <div className="text-center py-12 text-zinc-400">
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
