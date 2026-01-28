"use client";

import { useState, useEffect } from "react";
import { Member, MemberRole } from "@prisma/client";
import {
  Edit,
  FileIcon,
  ShieldAlert,
  ShieldCheck,
  Trash,
  Smile,
  Pin,
  Reply,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { MemberWithProfile, ReplyMessage } from "@/types";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ImageLightbox } from "./image-lightbox";
import { MessageContent } from "./message-content";
import { useReplyStore } from "@/hooks/use-reply-store";

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
  // New props for grouping and replies
  isCompact?: boolean;
  replyTo?: ReplyMessage | null;
  channelId?: string;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

// Role colors map
const roleColorMap: Record<MemberRole, string> = {
  ADMIN: "text-rose-500",
  MODERATOR: "text-indigo-500",
  GUEST: "text-foreground",
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
  isCompact = false,
  replyTo,
  channelId,
}: ChatItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [, setIsDeleting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { setReplyTo } = useReplyStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  // Reset form when content changes
  useEffect(() => {
    form.reset({ content });
  }, [content, form]);

  // Handle Escape key to cancel editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
        form.reset({ content });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, content, form]);

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
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Не удалось редактировать сообщение");
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
      toast.error("Не удалось удалить сообщение");
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
      toast.success("Сообщение закреплено");
    } catch (error) {
      console.log(error);
    }
  };

  const onReply = () => {
    setReplyTo(
      {
        id,
        content: deleted ? "Сообщение удалено" : content,
        member,
      },
      channelId
    );
  };

  const onCopyContent = () => {
    navigator.clipboard.writeText(content);
    toast.success("Скопировано в буфер обмена");
  };

  const onCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success("ID скопирован");
  };

  const fileType = fileUrl?.split(".").pop();
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  // Get member's display color from custom roles or default role
  const getMemberColor = () => {
    // Check for custom roles with colors
    if (member.customRoles && member.customRoles.length > 0) {
      // Get highest position role
      const sortedRoles = [...member.customRoles].sort(
        (a, b) => b.role.position - a.role.position
      );
      const topRole = sortedRoles[0];
      if (topRole?.role.color && topRole.role.color !== "#99AAB5") {
        return { color: topRole.role.color };
      }
    }
    // Fall back to default role color
    return undefined;
  };

  const memberColor = getMemberColor();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "relative group flex items-center hover:bg-black/5 dark:hover:bg-white/5 transition w-full",
            isCompact ? "py-0.5 px-4" : "p-4",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          )}
        >
          <div className="group flex gap-x-2 items-start w-full">
            {/* Avatar - hidden in compact mode */}
            {!isCompact ? (
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition">
                <AvatarImage src={member.profile.imageUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {member.profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-[10px] text-muted-foreground">
                  {timestamp.split(",")[1]?.trim().split(":").slice(0, 2).join(":")}
                </span>
              </div>
            )}

            <div className="flex flex-col w-full">
              {/* Reply indicator */}
              {replyTo && !deleted && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted-foreground/30">
                  <Reply className="h-3 w-3 rotate-180" />
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={replyTo.member.profile.imageUrl} />
                    <AvatarFallback className="text-[8px]">
                      {replyTo.member.profile.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{replyTo.member.profile.name}</span>
                  <span className="truncate max-w-[200px]">
                    {replyTo.deleted ? "Сообщение удалено" : replyTo.content}
                  </span>
                </div>
              )}

              {/* Name and time - hidden in compact mode */}
              {!isCompact && (
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center">
                    <p
                      className={cn(
                        "font-semibold text-sm hover:underline cursor-pointer",
                        roleColorMap[member.role]
                      )}
                      style={memberColor}
                    >
                      {member.profile.name}
                    </p>
                    <TooltipProvider>
                      <Tooltip delayDuration={50}>
                        <TooltipTrigger>{roleIconMap[member.role]}</TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {member.role === "ADMIN"
                              ? "Администратор"
                              : member.role === "MODERATOR"
                              ? "Модератор"
                              : "Гость"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs text-muted-foreground">{timestamp}</span>
                </div>
              )}

              {/* Image */}
              {isImage && (
                <>
                  <div
                    onClick={() => setLightboxOpen(true)}
                    className="relative rounded-md mt-2 overflow-hidden border flex items-center bg-secondary max-w-sm cursor-pointer group/image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl}
                      alt={content || "Изображение"}
                      className="max-h-80 w-auto object-contain rounded transition group-hover/image:opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                      <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                        Нажмите для просмотра
                      </span>
                    </div>
                  </div>
                  <ImageLightbox
                    src={fileUrl}
                    alt={content || "Изображение"}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                  />
                </>
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

              {/* Message content */}
              {!fileUrl && !isEditing && (
                <div
                  className={cn(
                    "text-sm",
                    deleted && "italic text-muted-foreground text-xs mt-1"
                  )}
                >
                  {deleted ? (
                    "Сообщение удалено"
                  ) : (
                    <MessageContent content={content} />
                  )}
                  {isUpdated && !deleted && (
                    <span className="text-[10px] mx-2 text-muted-foreground">
                      (изменено)
                    </span>
                  )}
                </div>
              )}

              {/* Edit form */}
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
                                autoFocus
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

          {/* Action buttons on hover */}
          {!deleted && (
            <div className="hidden group-hover:flex items-center gap-x-1 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-md shadow-sm">
              {/* Reply */}
              <TooltipProvider>
                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onReply}
                      className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                    >
                      <Reply className="h-4 w-4 text-muted-foreground hover:text-foreground transition" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ответить</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Reactions */}
              <TooltipProvider>
                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Smile className="h-4 w-4 text-muted-foreground hover:text-foreground transition" />
                      </button>
                      {showReactionPicker && (
                        <div className="absolute top-8 right-0 bg-white dark:bg-zinc-800 border rounded-lg p-2 flex gap-1 z-50 shadow-lg">
                          {["👍", "❤️", "😂", "😮", "😢", "🔥", "✨", "🎉"].map(
                            (emoji) => (
                              <button
                                key={emoji}
                                onClick={() => onReaction(emoji)}
                                className="text-xl hover:scale-125 transition p-1"
                              >
                                {emoji}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Реакция</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Pin (moderators/admins only) */}
              {(isAdmin || isModerator) && (
                <TooltipProvider>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onPin}
                        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Pin className="h-4 w-4 text-muted-foreground hover:text-foreground transition" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Закрепить</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Edit */}
              {canEditMessage && (
                <TooltipProvider>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground transition" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Редактировать</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Delete */}
              {canDeleteMessage && (
                <TooltipProvider>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onDelete}
                        className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Trash className="h-4 w-4 text-muted-foreground hover:text-rose-500 transition" />
                      </button>
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
      </ContextMenuTrigger>

      {/* Context menu */}
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onReply} disabled={deleted}>
          <Reply className="h-4 w-4 mr-2" />
          Ответить
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setShowReactionPicker(true)} disabled={deleted}>
          <Smile className="h-4 w-4 mr-2" />
          Добавить реакцию
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCopyContent} disabled={deleted}>
          <Copy className="h-4 w-4 mr-2" />
          Копировать текст
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyId}>
          <Copy className="h-4 w-4 mr-2" />
          Копировать ID
        </ContextMenuItem>
        {(isAdmin || isModerator) && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onPin} disabled={deleted}>
              <Pin className="h-4 w-4 mr-2" />
              Закрепить сообщение
            </ContextMenuItem>
          </>
        )}
        {canEditMessage && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </ContextMenuItem>
          </>
        )}
        {canDeleteMessage && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={onDelete}
              className="text-rose-500 focus:text-rose-500"
            >
              <Trash className="h-4 w-4 mr-2" />
              Удалить
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
