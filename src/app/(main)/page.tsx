import { redirect } from "next/navigation";
import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";
import { HomeScreen } from "@/components/home/home-screen";

/**
 * Главная страница ECHO
 * Показывает домашний экран с друзьями и опцией создания/присоединения к серверам
 */
export default async function HomePage() {
  // Получаем или создаём профиль пользователя
  const profile = await initialProfile();

  // Получаем серверы пользователя
  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // Показываем домашний экран
  return <HomeScreen profile={profile} hasServers={servers.length > 0} />;
}
