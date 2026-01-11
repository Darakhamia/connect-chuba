"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useModal } from "@/hooks/use-modal-store";

export function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const handleClose = () => {
    setFileUrl("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          content: fileUrl,
        }),
      });

      router.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-card-foreground p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Прикрепить файл
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Отправьте изображение или PDF файл
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="flex items-center justify-center">
            <FileUpload
              endpoint="messageFile"
              value={fileUrl}
              onChange={(url) => setFileUrl(url || "")}
            />
          </div>
        </div>

        <DialogFooter className="bg-muted px-6 py-4">
          <Button
            disabled={isLoading || !fileUrl}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Отправка..." : "Отправить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

