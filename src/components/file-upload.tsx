"use client";

import { X, Upload, FileIcon } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  endpoint: keyof OurFileRouter;
  value: string;
  onChange: (url?: string) => void;
}

export function FileUpload({ endpoint, value, onChange }: FileUploadProps) {
  const fileType = value?.split(".").pop();

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

  // Dropzone для загрузки
  return (
    <UploadDropzone<OurFileRouter, typeof endpoint>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0]?.url);
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
        alert(`Ошибка загрузки: ${error.message}`);
      }}
      appearance={{
        container: "border-dashed border-2 border-muted-foreground/25 rounded-lg",
        label: "text-muted-foreground",
        allowedContent: "text-muted-foreground/70 text-xs",
        button: "bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:bg-primary/70",
      }}
      content={{
        label: () => (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <span>Перетащите файл или нажмите для выбора</span>
          </div>
        ),
        allowedContent: "Изображение до 4MB",
      }}
    />
  );
}

