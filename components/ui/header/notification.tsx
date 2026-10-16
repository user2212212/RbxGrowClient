"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { Virtuoso } from "react-virtuoso";
import { timeAgo } from "@/lib/time";
import { API } from "@/lib/env";
import { useSiteStore } from "@/store/site";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { BellIcon, WalletIcon } from "@/components/icons";
import { Button } from "@/components/shadcn/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { Notification } from "@/types/notification";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  getNotifications: (token: string) => Promise<void>;
  markAllRead: (token: string) => Promise<void>;
  markRead: (id: string, token: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  getNotifications: async (token) => {
    try {
      const res = await fetch(`${API}/auth/me/notifications`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data?.message ?? "sorry we couldn't get your notifications.");
        return;
      }
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } catch {
      toast.error("Something went wrong");
    }
  },

  markAllRead: async (token) => {
    const prev = get().notifications;
    set({ notifications: prev.map((n) => ({ ...n, read: true })), unreadCount: 0 });

    try {
      const res = await fetch(`${API}/auth/me/notifications/read/all`, {
        method: "POST",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        set({ notifications: prev, unreadCount: prev.filter((n) => !n.read).length });
        toast.error(data?.message ?? "Something went wrong");
      }
    } catch {
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.read).length });
      toast.error("Something went wrong");
    }
  },

  markRead: async (id, token) => {
    const prev = get().notifications;
    const target = prev.find((n) => n._id === id);
    if (!target || target.read) return;

    set({
      notifications: prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      const res = await fetch(`${API}/auth/me/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ notification: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        set({ notifications: prev, unreadCount: prev.filter((n) => !n.read).length });
      }
    } catch {
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.read).length });
    }
  },

  addNotification: (notification) =>
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    }),
}));

export default function NotificationPopover() {
  const { socket, user, token } = useSiteStore();
  const { notifications, unreadCount, getNotifications, markAllRead, markRead, addNotification } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0); 

  useEffect(() => {
    if (user && token) void getNotifications(token);
  }, [user, token]);

  useEffect(() => {
    if (!socket) return;
    const onNotification = (notification: Notification) => addNotification(notification);
    socket.on("user:notification", onNotification);
    return () => {
      socket.off("user:notification", onNotification);
    };
  }, [socket]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"icon"} size={"icon"}>
          <BellIcon className="size-5" incoming={unreadCount!==0} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-75 bg-background rounded-[11px] py-3.5 pl-3.5 flex flex-col gap-1.5 h-70 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-1 pr-3.5">
          <div className="flex items-center gap-2.5">
            <BellIcon className="w-5 h-6 text-icon-secondary" />
            <span className="text-[16px] font-medium text-icon-secondary">My Inbox</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-6.5 h-6.5 bg-wallet rounded-[5px] cursor-pointer"
          >
            <XIcon className="w-4.25 h-4.25 text-grey" />
          </button>
        </div>

        <div className="flex items-center justify-between px-0.5 mb-0.5 pr-3.5">
          <span className="text-[12px] font-medium text-[#CDBCD0]">New</span>
          <button
            type="button"
            onClick={() => token && markAllRead(token)}
            className="text-[12px] font-medium text-[#CDBCD0] cursor-pointer disabled:opacity-40"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <Virtuoso
            style={{ height: "100%" }}
            data={notifications}
            className="pr-2"
            itemContent={(_, n) => (
              <button
                type="button"
                onClick={() => token && markRead(n._id, token)}
                className="flex items-stretch w-full h-17 mb-1.75 bg-[#16152C] rounded-[9px] overflow-hidden text-left cursor-pointer"
              >
                <div className="flex items-center justify-center w-14.25 h-full shrink-0 rounded-l-[9px] bg-[#1E1C36]">
                  {n.data?.icon ? (
                    <Image src={n.data.icon} width={43} height={43} alt="notification icon" />
                  ) : (
                    <WalletIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0 px-4 py-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#AEAAB6] truncate">
                      {n.title}
                    </span>
                    <span className="flex items-center gap-1.25 shrink-0">
                      {!n.read && (
                        <span
                          className={cn("w-2 h-2 rounded-full")}
                          style={{
                            background:
                              "linear-gradient(90deg, var(--purple-primary) -3.7%, #9533FF 100.8%)",
                          }}
                        />
                      )}
                      <span className="text-[9px] font-medium leading-[11px] text-[#877A89]">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#877A89] leading-tight line-clamp-2">
                    {n.message}
                  </span>
                </div>
              </button>
            )}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}