"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import qs from "query-string";
import { Plus, SendHorizontal } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "channel" | "conversation";
}

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
  const { onOpen } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-chat-input rounded-lg">
                    {/* Кнопка прикрепления файла */}
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

                    {/* Поле ввода */}
                    <Input
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder={`Написать ${type === "channel" ? `в #${name}` : name}`}
                      {...field}
                    />

                    {/* Кнопка эмодзи */}
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

                    {/* Кнопка отправки */}
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
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
