"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileToggleProps {
  navigationSidebar: React.ReactNode;
  serverSidebar: React.ReactNode;
}

export function MobileToggle({ navigationSidebar, serverSidebar }: MobileToggleProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          {navigationSidebar}
        </div>
        {serverSidebar}
      </SheetContent>
    </Sheet>
  );
}
