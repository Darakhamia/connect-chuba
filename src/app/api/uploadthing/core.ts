import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Middleware для проверки авторизации
const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
};

// Определяем типы файлов и их ограничения
export const ourFileRouter = {
  // Аватар сервера
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Server image uploaded by:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),

  // Файлы в сообщениях
  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Message file uploaded by:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

