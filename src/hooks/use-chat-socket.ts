"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

// Типы для сообщений
type MessageWithMemberWithProfile = {
  id: string;
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  memberId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  member: {
    id: string;
    role: string;
    profileId: string;
    serverId: string;
    profile: {
      id: string;
      userId: string;
      name: string;
      imageUrl: string;
      email: string;
    };
  };
};

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

export function useChatSocket({ addKey, updateKey, queryKey }: ChatSocketProps) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Обработка обновления сообщения
    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: unknown) => {
        const data = oldData as { pages: Array<{ items: MessageWithMemberWithProfile[] }> } | null;
        if (!data || !data.pages || data.pages.length === 0) {
          return oldData;
        }

        const newData = data.pages.map((page) => {
          return {
            ...page,
            items: page.items.map((item) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            }),
          };
        });

        return {
          ...data,
          pages: newData,
        };
      });
    });

    // Обработка нового сообщения
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: unknown) => {
        const data = oldData as { pages: Array<{ items: MessageWithMemberWithProfile[] }> } | null;
        if (!data || !data.pages || data.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...data.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...data,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
}
