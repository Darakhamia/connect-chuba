import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/**
 * Создание начального профиля для нового пользователя
 * Вызывается при первом входе в приложение
 */
export async function initialProfile() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Проверяем, есть ли уже профиль
  const existingProfile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  // Создаём новый профиль
  const profile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Пользователь",
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress || "",
    },
  });

  return profile;
}

