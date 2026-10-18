"use client";

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { API } from "@/lib/env";
import { useSiteStore } from "@/store/site";
import { Button } from "@/components/shadcn/button";
import { ReplyIcon, GiftIcon, RulesIcon } from "@/components/icons";
import { Input } from "@/components/shadcn/input";
import { getRank, getRankColor } from "@/lib/ranks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import InventoryModal, { InventorySecondAction } from "@/components/modals/inventory";
import EmojiPopover, { useEmojiStore } from "./emoji";
import PrettyMs from "pretty-ms"
import { Slider } from "@/components/shadcn/slider";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/modals/profile";
import toast from "react-hot-toast";
import type { ChatMessage } from "@/types/chat";
import Giveaway from "./giveaway";

interface ChatStore {
  messages: ChatMessage[];
  channel: string | null;
  getMessages: (channel: string, errors: { load: string; generic: string }) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  channel: null,

  getMessages: async (channel, errors) => {
    try {
      const res = await fetch(`${API}/chat/${channel}/messages?limit=25`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data?.message ?? errors.load);
        return;
      }
      set({ messages: [...data.messages].reverse().slice(-25), channel });
    } catch {
      toast.error(errors.generic);
    }
  },

  addMessage: (message) =>
    message.channel === get().channel &&
    !get().messages.some((m) => m._id === message._id) &&
    set({ messages: [...get().messages, message].slice(-25) }),
}));

export default function Chat({ className }: { className?: string }) {
  const t = useTranslations("Chat");
  const tc = useTranslations("Common");
  const { site, socket, token, user, onlineUsers, connected } = useSiteStore();
  const { messages, getMessages, addMessage } = useChatStore();
  const { emojis, getEmojis } = useEmojiStore();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [duration, setDuration] = useState(900)
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelName = (site as any)?.chat?.default?.name as string | undefined;

  useEffect(() => {
    if (channelName) void getMessages(channelName, { load: t("loadError"), generic: tc("somethingWentWrong") });
    void getEmojis();
  }, [channelName]);

  useEffect(() => {
    if (!socket || !channelName) return;
    socket.emit("chat:subscribe", channelName);
    const onMessage = (msg: ChatMessage) => addMessage(msg);
    socket.on("chat:message", onMessage);
    return () => {
      socket.emit("chat:unsubscribe", channelName);
      socket.off("chat:message", onMessage);
    };
  }, [socket, channelName]);

  useEffect(() => {
    const el = bottomRef.current?.parentElement;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages.length]);

  const handleEmojiSelect = (emoji: { name: string }) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? message.length;
    setMessage(message.slice(0, start) + `:${emoji.name}: ` + message.slice(el?.selectionEnd ?? message.length));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + `:${emoji.name}: `.length, start + `:${emoji.name}: `.length);
    });
  };

  const sendMessage = async () => {
    const content = message.trim();
    if (!channelName || !content || sending) return;
    if (!token) return toast.error(t("loginRequired"));

    setSending(true);
    try {
      const res = await fetch(replyingTo ? `${API}/chat/${channelName}/${replyingTo._id}/reply` : `${API}/chat/${channelName}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return toast.error(data?.message);
      setMessage("");
      setReplyingTo(null);
    } catch {
      toast.error(tc("somethingWentWrong"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("w-82.5 h-full flex flex-col bg-chat shrink-0", className)}>
      <div className="px-1.25 space-y-[-5px]">
        <Giveaway />
        <div className="flex w-full items-center justify-between py-2.5 px-1.5 select-none">
          <InventoryModal
            data={{
              action: {
                button: t("createGiveaway"),
                endpoint: `${API}/site/giveaways/create`,
                secondaction: InventorySecondAction.SelectBest,
                body: (items) => ({ items, duration }),
                closeComplete: true,
              },
              content: (
                <div className="flex items-center gap-3 h-8.5 px-3.5 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none sm:w-30">
                  <Slider
                    min={10}
                    max={1800}
                    step={10}
                    value={[duration]}
                    onValueChange={(v) => setDuration(v[0])}
                  />
                  </div>
                  <span className="shrink-0 w-16 sm:w-auto text-purple-gradient-secondary font-medium text-[14px] text-right select-none">{PrettyMs(duration * 1000)}</span>
                </div>
              ),
            }}>
            <Button
              variant={"foreground"}
              className="h-9.5 w-9.5 p-0 border-0 shrink-0 rounded-[8.5px] hover:opacity-85 transition-opacity duration-200"
            >
              <GiftIcon className="h-4.5 w-4.5 text-grey" />
            </Button>
          </InventoryModal>

          <div className="pointer-events-auto flex gap-2">
            <div className="flex h-[38px] w-[90.51px] shrink-0 items-center gap-2.5 rounded-lg bg-wallet px-3">
              <Image src="/icons/mainflag.png" alt="US" width={32} height={17} className="object-cover" />
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <div className="flex h-3.25 w-3.25 bg-purple-secondary items-center justify-center rounded-full animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-purple-primary"></div>
                  </div>
                  <h1 className="text-[15px] font-semibold text-white">{onlineUsers}</h1>
                </div>
              </div>
            </div>

            <Button
              variant="foreground"
              className="h-9.5 w-9.5 p-0 border-0 shrink-0 rounded-[8.5px] hover:opacity-85 transition-opacity duration-200"
            >
              <RulesIcon className="h-4.5 w-4.5 text-grey" />
            </Button>
          </div>
          </div>
      </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 py-2.5 flex flex-col gap-2  select-text!">
          {messages.map((m) => (
            <div key={m._id} className="group relative flex items-start gap-1.5 rounded-[7px] transition-colors duration-300 -mx-1.5 px-1.5">
              <div className="w-8.75 h-8.75 rounded-full overflow-hidden relative shrink-0 cursor-pointer hover:opacity-85 transition-opacity duration-200">
                <UserProfile userid={m.user._id}>
                  <Image src={!m.user || m.user.anonymous ? "/icons/anonymouse.webp" : m.user.avatar ?? "/icons/anonymouse.webp"} alt="" fill className="object-cover" />
                </UserProfile>
              </div>
              <div className="flex flex-col gap-1.5 pt-2.5 flex-1 min-w-0">
                <span className="flex items-center gap-1">
                  {!(!m.user || m.user.anonymous) && getRank(site?.ranks, m.user.ranks)?.icon && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image src={getRank(site?.ranks, m.user.ranks)!.icon!} alt="" width={14} height={14} />
                      </TooltipTrigger>
                      <TooltipContent>
                        {getRank(site?.ranks, m.user.ranks)?._id}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <span
                    className="text-xs font-bold"
                    style={getRankColor((!m.user || m.user.anonymous) ? undefined : getRank(site?.ranks, m.user.ranks)?.color)}
                  >
                    {!m.user || m.user.anonymous ? tc("anonymous") : m.user.username ?? tc("unknown")}
                  </span>
                </span>
                <div className="bg-foreground rounded-[7px] px-2.5 py-3">
                  <p className="text-[12px] font-medium leading-3.5 text-grey">
                    {m.replyTo && (
                      <span className="text-[12px] font-bold text-white mr-1">
                        @{m.replyTo.user?.anonymous || !m.replyTo.user ? tc("anonymous") : m.replyTo.user.username}
                      </span>
                    )}
                    {m.content.split(" ").map((word, i) => {
                      const emoji = emojis.find((e: { name: string }) => `:${e.name}:` === word);
                      if (!emoji) return word + " ";
                      return (
                        <Image
                          key={i}
                          src={emoji.animated ? emoji.url.replace(".webp", ".gif") : emoji.url}
                          alt={emoji.name}
                          width={22}
                          height={22}
                          className="inline-block align-middle mx-0.5"
                        />
                      );
                    })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReplyingTo(m);
                  inputRef.current?.focus();
                }}
                className="absolute top-2 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ReplyIcon className="h-3.5 w-3.5 text-grey" />
              </button>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

      <div className="relative px-5 pb-5 flex flex-col gap-3.5 outline-hidden select-none">
        {replyingTo && (
          <div className="absolute bottom-full left-5 right-5 font-semibold text-grey flex p-2 items-center justify-between">
            <span className="text-[11px]">
              {t.rich("replyTo", {
                username: `@${replyingTo.user?.anonymous || !replyingTo.user ? tc("anonymous") : replyingTo.user.username}`,
                name: (chunks) => <span className="text-white font-bold">{chunks}</span>,
              })}
            </span>
            <button type="button" onClick={() => setReplyingTo(null)} className="text-white cursor-pointer text-[15px]">
              ×
            </button>
          </div>
        )}
        <div className="relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendMessage())}
            disabled={!user}
            className="bg-input h-12.5 pr-12 text-grey placeholder:text-grey text-[16px] md:text-[14px] placeholder:text-[14px] font-medium placeholder:font-medium" placeholder={t("placeholder")}
          />
          <EmojiPopover onSelect={handleEmojiSelect} />
        </div>
        <Button
          variant={"default"}
          onClick={sendMessage}
          disabled={!user}
          className="h-9.25! rounded-[7px] font-bold text-[14px] active:not-aria-[haspopup]:scale-99"
        >
          {t("send")}
        </Button>
      </div>
    </div>
  );
}