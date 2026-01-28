"use client";

import { Fragment, useRef, ElementRef, useMemo } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Member } from "@prisma/client";
import { Hash, Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { ChatItem } from "./chat-item";
import { MessageWithMemberWithProfile } from "@/types";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

// Format date for separator
function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return "Сегодня";
  }
  if (isYesterday(date)) {
    return "Вчера";
  }
  return format(date, "d MMMM yyyy", { locale: ru });
}

// Check if messages should be grouped (same author, within 5 minutes)
function shouldGroupMessages(
  current: MessageWithMemberWithProfile,
  previous: MessageWithMemberWithProfile | null
): boolean {
  if (!previous) return false;
  if (current.memberId !== previous.memberId) return false;
  if (current.deleted || previous.deleted) return false;

  const currentTime = new Date(current.createdAt).getTime();
  const previousTime = new Date(previous.createdAt).getTime();
  const timeDiff = currentTime - previousTime;

  // Group if less than 5 minutes apart
  return timeDiff < 5 * 60 * 1000;
}

// Check if we need a date separator
function needsDateSeparator(
  current: MessageWithMemberWithProfile,
  previous: MessageWithMemberWithProfile | null
): boolean {
  if (!previous) return true;

  const currentDate = new Date(current.createdAt);
  const previousDate = new Date(previous.createdAt);

  return !isSameDay(currentDate, previousDate);
}

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

  // Flatten all messages and add grouping/separator info
  const processedMessages = useMemo(() => {
    if (!data?.pages) return [];

    const allMessages: MessageWithMemberWithProfile[] = [];

    // Flatten pages (they come in reverse order)
    data.pages.forEach((page) => {
      allMessages.push(...page.items);
    });

    // Messages are in reverse chronological order, reverse them for processing
    const chronologicalMessages = [...allMessages].reverse();

    return chronologicalMessages.map((message, index) => {
      const previousMessage = index > 0 ? chronologicalMessages[index - 1] : null;
      const isCompact = shouldGroupMessages(message, previousMessage);
      const showDateSeparator = needsDateSeparator(message, previousMessage);

      return {
        message,
        isCompact,
        showDateSeparator,
        dateSeparator: showDateSeparator
          ? formatDateSeparator(new Date(message.createdAt))
          : null,
      };
    });
  }, [data?.pages]);

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
      {/* Show welcome if no messages or reached the end */}
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

      {/* Load more button */}
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

      {/* Messages with grouping and date separators */}
      <div className="flex flex-col mt-auto">
        {processedMessages.map(({ message, isCompact, showDateSeparator, dateSeparator }) => (
          <Fragment key={message.id}>
            {/* Date separator */}
            {showDateSeparator && dateSeparator && (
              <div className="flex items-center gap-4 my-4 px-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  {dateSeparator}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            <ChatItem
              id={message.id}
              currentMember={member}
              member={message.member}
              content={message.content}
              fileUrl={message.fileUrl}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT, {
                locale: ru,
              })}
              isUpdated={message.updatedAt !== message.createdAt}
              socketUrl={socketUrl}
              socketQuery={socketQuery}
              isCompact={isCompact}
              replyTo={message.replyTo}
              channelId={paramKey === "channelId" ? paramValue : undefined}
            />
          </Fragment>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
