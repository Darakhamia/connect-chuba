import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Получение текущего профиля пользователя на сервере
 * Используется в Server Components и API routes
 */
export async function currentProfile() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId,
    },
  });

  return profile;
}

