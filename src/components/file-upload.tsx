"use client";

import { X, Upload, FileIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  endpoint: string;
  value: string;
  onChange: (url?: string) => void;
}

export function FileUpload({ endpoint, value, onChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileType = value?.split(".").pop();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Только изображения разрешены");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой. Максимум 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
      toast.success("Файл загружен!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка загрузки файла");
    } finally {
      setIsUploading(false);
    }
  };

  // Если есть изображение
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image
          fill
          src={value}
          alt="Загруженное изображение"
          className="rounded-full object-cover"
        />
        <button
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 transition"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Если это PDF
  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-muted">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 hover:underline"
        >
          {value}
        </a>
        <button
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 transition"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Upload area
  return (
    <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex flex-col items-center gap-2 py-4 hover:bg-muted/50 rounded transition"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Загрузка...</span>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Нажмите для выбора файла
            </span>
            <span className="text-xs text-muted-foreground/70">
              Изображение до 5MB
            </span>
          </>
        )}
      </button>
    </div>
  );
}

