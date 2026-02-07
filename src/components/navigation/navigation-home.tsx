"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavigationHome() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isActive = pathname === "/" || pathname.startsWith("/settings");

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => router.push("/")}
            className={cn(
              "group relative flex items-center justify-center w-12 h-12 rounded-[24px] transition-all duration-200 overflow-hidden",
              isActive
                ? "rounded-[16px] bg-primary/15"
                : "bg-card hover:rounded-[16px] hover:bg-primary/10"
            )}
          >
            <Sparkles
              className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-primary" : "text-primary/50 group-hover:text-primary"
              )}
            />

            {/* Active indicator pill */}
            <div
              className={cn(
                "absolute left-0 w-1 rounded-r-full transition-all duration-200 bg-primary",
                isActive ? "h-10" : "h-0 group-hover:h-5"
              )}
              style={{ transform: "translateX(-8px)" }}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-foreground border-border">
          <p className="font-semibold">Главная</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
