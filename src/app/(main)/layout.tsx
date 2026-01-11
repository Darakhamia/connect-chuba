import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
