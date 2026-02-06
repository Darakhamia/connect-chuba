'use client';

import { FixedSizeList as List } from 'react-window';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';

interface MessageUser {
  id: string;
  name: string;
  imageUrl: string;
}

interface MessageMember {
  id: string;
  profile: MessageUser;
}

interface MessageData {
  id: string;
  content: string;
  fileUrl?: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  member: MessageMember;
}

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const listRef = useRef<List>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: async ({ pageParam = undefined }) => {
      const params = new URLSearchParams({ channelId, limit: '50' });
      if (pageParam) params.set('cursor', pageParam);
      const res = await fetch(`/api/messages?${params.toString()}`);
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const messages: MessageData[] = data?.pages.flatMap((page) => page.items) ?? [];

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    if (scrollOffset < 100 && hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];

    if (!message) return null;

    return (
      <div style={style} className="px-4 py-2 hover:bg-chuba-grey transition-colors">
        <div className="flex gap-3">
          <img
            src={message.member.profile.imageUrl}
            alt={message.member.profile.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-chuba-text">
                {message.member.profile.name}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-chuba-text mt-1 break-words">
              {message.deleted ? (
                <span className="italic text-muted-foreground text-sm">
                  Сообщение удалено
                </span>
              ) : (
                message.content
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-sm">Загрузка...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-sm">Нет сообщений</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col-reverse">
      <List
        ref={listRef}
        height={600}
        itemCount={messages.length}
        itemSize={80}
        width="100%"
        onScroll={handleScroll}
      >
        {Row}
      </List>
    </div>
  );
}
