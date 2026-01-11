"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChannelType } from "@prisma/client";
import { Hash, Mic, Video } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Название канала обязательно",
    })
    .refine((name) => name !== "general", {
      message: "Название канала не может быть 'general'",
    }),
  type: z.nativeEnum(ChannelType),
});

export function CreateChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "createChannel";
  const { channelType } = data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType);
    } else {
      form.setValue("type", ChannelType.TEXT);
    }
  }, [channelType, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const url = `/api/channels?serverId=${params?.serverId}`;

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-card-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Создать канал
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                      Название канала
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="новый-канал"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                      Тип канала
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-input border-0 focus:ring-0 ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Выберите тип канала" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ChannelType.TEXT}>
                          <div className="flex items-center gap-x-2">
                            <Hash className="h-4 w-4" />
                            Текстовый
                          </div>
                        </SelectItem>
                        <SelectItem value={ChannelType.AUDIO}>
                          <div className="flex items-center gap-x-2">
                            <Mic className="h-4 w-4" />
                            Голосовой
                          </div>
                        </SelectItem>
                        <SelectItem value={ChannelType.VIDEO}>
                          <div className="flex items-center gap-x-2">
                            <Video className="h-4 w-4" />
                            Видео
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-muted px-6 py-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Создание..." : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

