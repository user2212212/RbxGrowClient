"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";
import Image from "next/image";
import { API } from "@/lib/env";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { EmojiIcon } from "@/components/icons";
import type { ChatEmoji } from "@/types/chat";
import { useSiteStore } from "@/store/site";

interface EmojiStore {
  emojis: ChatEmoji[];
  loading: boolean;
  loaded: boolean;
  getEmojis: () => Promise<void>;
}

export const useEmojiStore = create<EmojiStore>((set, get) => ({
  emojis: [],
  loading: false,
  loaded: false,

  getEmojis: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });

    try {
      const res = await fetch(`${API}/chat/emojis`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        set({ loading: false });
        return;
      }

      set({ emojis: data.emojis ?? [], loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },
}));

export default function EmojiPopover({ onSelect }: { onSelect: (emoji: ChatEmoji) => void }) {
  const { user } = useSiteStore();
  const { emojis, loading, getEmojis } = useEmojiStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) getEmojis();
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2" disabled={!user}>
          <EmojiIcon className="h-3.75 w-3.75 text-grey cursor-pointer" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={10}
        data-vaul-no-drag=""
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        style={{ touchAction: "pan-y", overscrollBehavior: "contain" }}
        className="w-65 h-70 overflow-y-auto overflow-x-hidden p-2.5 pr-3.5 rounded-[7px]"
      >
        <div className="grid grid-cols-4 gap-1.5">
          {!loading &&
            emojis.map((emoji) => (
              <button
                key={emoji.id}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="w-full aspect-square flex items-center justify-center shrink-0 cursor-pointer overflow-hidden select-none"
              >
                <Image
                  src={emoji.animated ? emoji.url.replace(/\.[^./?#]+(?=$|[?#])/, ".gif") : emoji.url}
                  alt={emoji.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  unoptimized={emoji.animated}
                />
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}