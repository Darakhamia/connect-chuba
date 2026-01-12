import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { NavigationHome } from "./navigation-home";

export async function NavigationSidebar() {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Получаем все серверы пользователя
  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  return (
    <div className="flex flex-col items-center h-full w-full bg-server-sidebar py-3 space-y-4">
      {/* Кнопка Домой / Друзья */}
      <NavigationHome />
      
      <Separator className="h-[2px] w-10 bg-border rounded-full mx-auto" />
      
      {/* Кнопка добавления сервера */}
      <NavigationAction />
      
      {/* Список серверов */}
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      
    </div>
  );
}

