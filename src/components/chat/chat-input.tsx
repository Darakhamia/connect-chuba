"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import qs from "query-string";
import { Plus, SendHorizontal, X, Reply, AtSign, Mic } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { useReplyStore } from "@/hooks/use-reply-store";
import { EmojiPicker } from "@/components/emoji-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MemberWithProfile } from "@/types";
import { VoiceRecorder } from "./voice-message";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "channel" | "conversation";
  members?: MemberWithProfile[];
  channelId?: string;
}

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatInput({
  apiUrl,
  query,
  name,
  type,
  members = [],
  channelId,
}: ChatInputProps) {
  const { onOpen } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { replyTo, channelId: replyChannelId, clearReply } = useReplyStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mentions state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Voice message state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  // Filter members for mention suggestions
  const filteredMembers = members.filter((member) =>
    member.profile.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  // Handle input change for mentions
  const handleInputChange = useCallback(
    (value: string, cursorPos: number) => {
      // Check if we're typing a mention
      const textBeforeCursor = value.slice(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        setShowMentions(true);
        setMentionSearch(mentionMatch[1]);
        setMentionIndex(0);
      } else {
        setShowMentions(false);
        setMentionSearch("");
      }

      setCursorPosition(cursorPos);
    },
    []
  );

  // Insert mention
  const insertMention = useCallback(
    (memberName: string) => {
      const currentValue = form.getValues("content");
      const textBeforeCursor = currentValue.slice(0, cursorPosition);
      const textAfterCursor = currentValue.slice(cursorPosition);

      // Find the @ symbol position
      const mentionStart = textBeforeCursor.lastIndexOf("@");
      const newValue =
        textBeforeCursor.slice(0, mentionStart) +
        `@${memberName} ` +
        textAfterCursor;

      form.setValue("content", newValue);
      setShowMentions(false);
      setMentionSearch("");
      inputRef.current?.focus();
    },
    [cursorPosition, form]
  );

  // Handle keyboard navigation for mentions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showMentions) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMembers.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (filteredMembers[mentionIndex]) {
          e.preventDefault();
          insertMention(filteredMembers[mentionIndex].profile.name);
        }
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    },
    [showMentions, filteredMembers, mentionIndex, insertMention]
  );

  // Focus input when replying
  useEffect(() => {
    if (replyTo && replyChannelId === channelId) {
      inputRef.current?.focus();
    }
  }, [replyTo, replyChannelId, channelId]);

  // Handle escape to cancel reply
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && replyTo) {
        clearReply();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [replyTo, clearReply]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      const body: { content: string; replyToId?: string } = {
        content: values.content,
      };

      // Add reply reference if replying
      if (replyTo && replyChannelId === channelId) {
        body.replyToId = replyTo.id;
      }

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      form.reset();
      clearReply();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isReplying = replyTo && replyChannelId === channelId;

  // Handle voice message recording complete
  const handleVoiceRecordComplete = async (blob: Blob, duration: number) => {
    try {
      setIsLoading(true);

      // Create form data with audio file
      const formData = new FormData();
      formData.append("file", blob, `voice-${Date.now()}.webm`);

      // Upload the audio file
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload voice message");
      }

      const { url: fileUrl } = await uploadResponse.json();

      // Send message with audio file URL
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `🎤 Голосовое сообщение (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`,
          fileUrl,
        }),
      });

      setIsRecordingVoice(false);
      router.refresh();
    } catch (error) {
      console.error("Error sending voice message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Reply preview */}
      {isReplying && (
        <div className="absolute bottom-full left-4 right-4 mb-1 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-t-lg border-l-2 border-blue-500">
            <Reply className="h-4 w-4 text-blue-500 rotate-180" />
            <span className="text-xs text-muted-foreground">
              Отвечая на сообщение от
            </span>
            <span className="text-xs font-medium">{replyTo.member.profile.name}</span>
            <span className="text-xs text-muted-foreground truncate flex-1 max-w-[200px]">
              {replyTo.content}
            </span>
            <button
              onClick={clearReply}
              className="p-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Voice recorder */}
      {isRecordingVoice && (
        <div className="absolute bottom-full left-4 right-4 mb-2 animate-in slide-in-from-bottom-2 duration-200">
          <VoiceRecorder
            onRecordComplete={handleVoiceRecordComplete}
            onCancel={() => setIsRecordingVoice(false)}
          />
        </div>
      )}

      {/* Mentions dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-zinc-800 border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-200 z-50">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
            Участники
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredMembers.slice(0, 10).map((member, index) => (
              <button
                key={member.id}
                onClick={() => insertMention(member.profile.name)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition",
                  index === mentionIndex && "bg-zinc-100 dark:bg-zinc-700"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.profile.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {member.profile.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.profile.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {member.role === "ADMIN"
                    ? "Админ"
                    : member.role === "MODERATOR"
                    ? "Модер"
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative p-4 pb-6">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-chat-input rounded-lg",
                        isReplying && "rounded-t-none"
                      )}
                    >
                      {/* Attach file button */}
                      <TooltipProvider delayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => onOpen("messageFile", { apiUrl, query })}
                              className="text-muted-foreground hover:text-foreground transition"
                            >
                              <Plus className="h-6 w-6" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Прикрепить файл</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Input field */}
                      <Input
                        ref={inputRef}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder={`Написать ${type === "channel" ? `в #${name}` : name}`}
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleInputChange(
                            e.target.value,
                            e.target.selectionStart || 0
                          );
                        }}
                        onKeyDown={handleKeyDown}
                        onSelect={(e) => {
                          const target = e.target as HTMLInputElement;
                          setCursorPosition(target.selectionStart || 0);
                        }}
                      />

                      {/* Mention button */}
                      {members.length > 0 && (
                        <TooltipProvider delayDuration={50}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValue = form.getValues("content");
                                  form.setValue("content", currentValue + "@");
                                  setShowMentions(true);
                                  setMentionSearch("");
                                  inputRef.current?.focus();
                                }}
                                className="text-muted-foreground hover:text-foreground transition"
                              >
                                <AtSign className="h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Упомянуть</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Emoji button */}
                      <TooltipProvider delayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <EmojiPicker
                                onChange={(emoji: string) => {
                                  field.onChange(`${field.value}${emoji}`);
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Выбрать эмодзи</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Voice message button */}
                      {!field.value && (
                        <TooltipProvider delayDuration={50}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setIsRecordingVoice(true)}
                                className="text-muted-foreground hover:text-foreground transition"
                              >
                                <Mic className="h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Голосовое сообщение</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Send button */}
                      {field.value && (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="text-primary hover:text-primary/80 transition"
                        >
                          <SendHorizontal className="h-6 w-6" />
                        </button>
                      )}
                    </div>

                    {/* Formatting hints */}
                    <div className="absolute -bottom-1 left-4 text-[10px] text-muted-foreground">
                      <span className="opacity-0 hover:opacity-100 transition">
                        **жирный** • *курсив* • ~~зачёркнутый~~ • `код` • ||спойлер||
                      </span>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
