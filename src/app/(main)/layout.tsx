import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { PresenceProvider } from "@/components/providers/presence-provider";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <PresenceProvider profileId={profile.id}>
      <div className="h-screen">
        {/* Сайдбар навигации по серверам */}
        <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
          <NavigationSidebar />
        </div>
        
        {/* Основной контент */}
        <main className="md:pl-[72px] h-full">
          {children}
        </main>
      </div>
    </PresenceProvider>
  );
}
