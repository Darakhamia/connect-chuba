import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ServerLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
  }>;
}

export default async function ServerLayout({ children, params }: ServerLayoutProps) {
  const { serverId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    redirect("/");
  }

  return (
    <div className="h-full">
      {/* Сайдбар каналов сервера */}
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      
      {/* Контент канала */}
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  );
}

