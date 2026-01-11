import { redirect } from "next/navigation";
import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";
import { InitialModal } from "@/components/modals/initial-modal";

/**
 * Главная страница приложения
 * Проверяет есть ли у пользователя серверы, если нет - показывает модал создания
 */
export default async function HomePage() {
  // Получаем или создаём профиль пользователя
  const profile = await initialProfile();

  // Ищем первый сервер, где пользователь является участником
  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // Если есть сервер - редиректим на него
  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  // Если нет серверов - показываем модал создания первого сервера
  return <InitialModal />;
}

