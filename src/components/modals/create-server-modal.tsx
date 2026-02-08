"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useModal } from "@/hooks/use-modal-store";
import {
  Gamepad2,
  GraduationCap,
  Users,
  Music,
  Code,
  Globe,
  ArrowLeft,
} from "lucide-react";

const templates = [
  { id: "gaming", label: "Игровой", icon: Gamepad2, color: "text-green-500" },
  { id: "study", label: "Учёба", icon: GraduationCap, color: "text-blue-500" },
  { id: "friends", label: "Друзья", icon: Users, color: "text-yellow-500" },
  { id: "music", label: "Музыка", icon: Music, color: "text-pink-500" },
  { id: "dev", label: "Разработка", icon: Code, color: "text-purple-500" },
  { id: "other", label: "Другое", icon: Globe, color: "text-muted-foreground" },
] as const;

type TemplateId = (typeof templates)[number]["id"];

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Название сервера обязательно",
  }),
  imageUrl: z.string().optional(),
  description: z.string().max(200, {
    message: "Максимум 200 символов",
  }).optional(),
});

export function CreateServerModal() {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);

  const isModalOpen = isOpen && type === "createServer";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create server");
      }

      const server = await response.json();

      form.reset();
      setStep("template");
      setSelectedTemplate(null);
      onClose();
      // Full page reload to guarantee server-component sidebar re-renders
      window.location.href = `/servers/${server.id}`;
    } catch (error) {
      console.error("Error creating server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setStep("template");
    setSelectedTemplate(null);
    onClose();
  };

  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    setStep("details");
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-card-foreground p-0 overflow-hidden max-w-md">
        {step === "template" && (
          <>
            <DialogHeader className="pt-8 px-6">
              <DialogTitle className="text-2xl text-center font-bold">
                Создать сервер
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Выберите шаблон для вашего сервера
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6 pt-2 space-y-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <tmpl.icon className={`w-5 h-5 ${tmpl.color}`} />
                  </div>
                  <span className="font-medium text-sm text-foreground">
                    {tmpl.label}
                  </span>
                  <svg
                    className="w-4 h-4 text-muted-foreground ml-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <DialogHeader className="pt-6 px-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("template")}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <DialogTitle className="text-xl font-bold">
                  Настройте сервер
                </DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground text-sm">
                Добавьте аватарку и описание. Вы сможете изменить это позже.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5 px-6">
                  {/* Аватарка сервера */}
                  <div className="flex justify-center">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              endpoint="serverImage"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Название сервера */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                          Название сервера
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Мой крутой сервер"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Описание сервера */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                          Описание
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isLoading}
                            className="bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px]"
                            placeholder="Расскажите о вашем сервере..."
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center">
                          <FormMessage />
                          <span className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0}/200
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="bg-muted px-6 py-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Создание..." : "Создать"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
