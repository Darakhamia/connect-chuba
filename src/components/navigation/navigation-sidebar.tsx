import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { ThemeToggle } from "@/components/theme-toggle";

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
      {/* Кнопка добавления сервера */}
      <NavigationAction />
      
      <Separator className="h-[2px] w-10 bg-border rounded-full mx-auto" />
      
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
      
      <Separator className="h-[2px] w-10 bg-border rounded-full mx-auto" />
      
      {/* Нижняя панель */}
      <div className="flex flex-col items-center gap-y-4 pb-3">
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-[48px] w-[48px]",
            },
          }}
        />
      </div>
    </div>
  );
}

