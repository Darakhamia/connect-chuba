"use client";

import { useState } from "react";
import Image from "next/image";
import { Member, MemberRole } from "@prisma/client";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash, Smile, Pin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import qs from "query-string";

import { cn } from "@/lib/utils";
import { MemberWithProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatItemProps {
  id: string;
  content: string;
  member: MemberWithProfile;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatItem({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [, setIsDeleting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await fetch(url, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onReaction = async (emoji: string) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}/reactions`,
        query: socketQuery,
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      });
      
      setShowReactionPicker(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const onPin = async () => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}/pin`,
        query: socketQuery,
      });

      await fetch(url, {
        method: "PATCH",
      });
      
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const fileType = fileUrl?.split(".").pop();
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        {/* Аватар */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.profile.imageUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {member.profile.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full">
          {/* Имя и время */}
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm hover:underline cursor-pointer">
                {member.profile.name}
              </p>
              <TooltipProvider>
                <Tooltip delayDuration={50}>
                  <TooltipTrigger>
                    {roleIconMap[member.role]}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{member.role === "ADMIN" ? "Администратор" : member.role === "MODERATOR" ? "Модератор" : "Гость"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          {/* Изображение */}
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}

          {/* PDF */}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF файл
              </a>
            </div>
          )}

          {/* Контент сообщения */}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-foreground",
                deleted && "italic text-muted-foreground text-xs mt-1"
              )}
            >
              {deleted ? "Сообщение удалено" : content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-muted-foreground">
                  (изменено)
                </span>
              )}
            </p>
          )}

          {/* Форма редактирования */}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Изменённое сообщение"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm">
                  Сохранить
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-muted-foreground">
                Нажмите Escape для отмены, Enter для сохранения
              </span>
            </Form>
          )}
        </div>
      </div>

      {/* Кнопки действий */}
      {!deleted && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {/* Реакции */}
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger>
                <div className="relative">
                  <Smile
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className="cursor-pointer w-4 h-4 text-muted-foreground hover:text-foreground transition"
                  />
                  {showReactionPicker && (
                    <div className="absolute top-6 right-0 bg-white dark:bg-zinc-800 border rounded-md p-2 flex gap-1 z-50">
                      {["👍", "❤️", "😂", "😮", "😢", "🔥", "✨", "🎉"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => onReaction(emoji)}
                          className="text-xl hover:scale-125 transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Реакция</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Закрепить (только для модераторов/админов) */}
          {(currentMember.role === MemberRole.ADMIN || currentMember.role === MemberRole.MODERATOR) && (
            <TooltipProvider>
              <Tooltip delayDuration={50}>
                <TooltipTrigger>
                  <Pin
                    onClick={onPin}
                    className="cursor-pointer w-4 h-4 text-muted-foreground hover:text-foreground transition"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Закрепить</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Редактировать */}
          {canEditMessage && (
            <TooltipProvider>
              <Tooltip delayDuration={50}>
                <TooltipTrigger>
                  <Edit
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer ml-auto w-4 h-4 text-muted-foreground hover:text-foreground transition"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Редактировать</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Удалить */}
          {canDeleteMessage && (
            <TooltipProvider>
              <Tooltip delayDuration={50}>
                <TooltipTrigger>
                  <Trash
                    onClick={onDelete}
                    className="cursor-pointer ml-auto w-4 h-4 text-muted-foreground hover:text-rose-500 transition"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Удалить</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}

