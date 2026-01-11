"use client";

import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition"
        >
          <Smile className="h-6 w-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={theme === "dark" ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: { native: string }) => onChange(emoji.native)}
          locale="ru"
        />
      </PopoverContent>
    </Popover>
  );
}

