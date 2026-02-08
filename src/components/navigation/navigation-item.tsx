"use client";

import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export function NavigationItem({ id, name, imageUrl }: NavigationItemProps) {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="group relative flex items-center">
            {/* Индикатор активного сервера */}
            <div
              className={cn(
                "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                params?.serverId !== id && "group-hover:h-[20px]",
                params?.serverId === id ? "h-[36px]" : "h-[8px]"
              )}
            />

            {/* Иконка сервера */}
            <div
              className={cn(
                "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden bg-muted items-center justify-center",
                params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
              )}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <span className="text-sm font-semibold select-none">
                {initials}
              </span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border-border">
          <p className="font-semibold">{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
