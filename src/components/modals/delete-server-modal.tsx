"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteServerModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "deleteServer";
  const { server } = data;

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/servers/${server?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete server");
      }

      onClose();
      router.push("/");
      router.refresh();
      // Force reload to update navigation sidebar
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Удалить сервер
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Вы уверены, что хотите удалить{" "}
            <span className="font-semibold text-primary">{server?.name}</span>?
            <br />
            <span className="text-rose-500 font-semibold">
              Это действие нельзя отменить!
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-muted px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Отмена
            </Button>
            <Button disabled={isLoading} variant="destructive" onClick={onClick}>
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

