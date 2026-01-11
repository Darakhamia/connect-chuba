"use client";

import { Fragment, useRef, ElementRef } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Member } from "@prisma/client";
import { Hash, Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { ChatItem } from "./chat-item";
import { MessageWithMemberWithProfile } from "@/types";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export function ChatMessages({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  useChatSocket({ queryKey, addKey, updateKey });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-muted-foreground animate-spin my-4" />
        <p className="text-xs text-muted-foreground">Загрузка сообщений...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-muted-foreground my-4" />
        <p className="text-xs text-muted-foreground">Что-то пошло не так!</p>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {/* Показываем приветствие если нет сообщений или достигли конца */}
      {!hasNextPage && <div className="flex-1" />}
      
      {!hasNextPage && (
        <div className="space-y-2 px-4 mb-4">
          <div className="h-[75px] w-[75px] rounded-full bg-muted flex items-center justify-center">
            <Hash className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <p className="text-xl md:text-3xl font-bold">
            {type === "channel" ? `Добро пожаловать в #${name}!` : name}
          </p>
          
          <p className="text-muted-foreground text-sm">
            {type === "channel"
              ? `Это начало канала #${name}.`
              : `Это начало вашей личной переписки с ${name}.`}
          </p>
        </div>
      )}

      {/* Кнопка загрузки ещё */}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-muted-foreground hover:text-foreground text-xs my-4 transition"
            >
              Загрузить предыдущие сообщения
            </button>
          )}
        </div>
      )}

      {/* Сообщения */}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessageWithMemberWithProfile) => (
              <ChatItem
                key={message.id}
                id={message.id}
                currentMember={member}
                member={message.member}
                content={message.content}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT, { locale: ru })}
                isUpdated={message.updatedAt !== message.createdAt}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
