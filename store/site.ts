"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { API } from "@/lib/env";
import type { SiteConfig } from "@/types/site";
import type { Inventory, User } from "@/types/user";
import toast from "react-hot-toast";
import { getToken } from "@/lib/token";

interface SiteStore {
  socket: Socket | null;
  connected: boolean;
  user: User | null;
  inventory: Inventory | null,
  site: SiteConfig | null;
  onlineUsers: number;
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  setSession: (token: string, user: User) => void;
}

export const useSiteStore = create<SiteStore>((set, get) => {
  const token = getToken();

  Promise.all([
    fetch(`${API}/site`).then((res) => (res.ok ? res.json() : null)),
    token
      ? fetch(`${API}/auth/me/user`, {
          headers: { Authorization: token },
        }).then((res) => (res.ok ? res.json() : null))
      : null,
    new Promise((resolve) => setTimeout(resolve, 2000)),
    new Promise((resolve) => {
      const check = setInterval(() => {
        if (get().connected) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
    }),
  ])
    .then(([site, user]) => set({ site, user: user?.user ?? null, inventory: user?.inventory, loading: false }))
    .catch(() => toast.error("Something went wrong"));

  const socket = io(API, {
    transports: ["websocket"],
    auth: { token: token },
  });

  socket.on("connect", () => {
    set({ connected: true });
  });
  socket.on("disconnect", () => set({ connected: false }));
  socket.on("authorized", () => socket.emit("user:subscribe"));
  socket.on("users", (count: number) => set({ onlineUsers: count }));
  socket.on("site:update", (updatedFields: any) => {
    const current = get().site;
    set({ site: current ? { ...current, settings: { ...(current as any).settings, ...updatedFields } } : ({ settings: updatedFields } as SiteConfig) });
  });
  socket.on("user:update", (updatedFields: any) => {
    const current: any = get().user;
     if (!current) return;

    const ranks = updatedFields.ranks ?? [...current.ranks];
    for (const key in updatedFields)
      if (key.startsWith("ranks.")) ranks[+key.split(".")[1]] = updatedFields[key];
      else if (key !== "ranks") current[key] = updatedFields[key];

    set({ user: { ...current, ranks } });
  });
  socket.on("inventory:update", (data: { value: number }) => {
    set({ inventory: { value: data.value } });
  });

  return {
    socket,
    connected: false,
    user: null,
    inventory: null,
    site: null,
    onlineUsers: 0,
    loading: true,
    token: token,
    setToken: (token: string | null) => {
      if (typeof window !== "undefined") {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
      }

      set({ token });
      socket.auth = { token };
      socket.disconnect().connect();

      if (!token) return set({ user: null });

      fetch(`${API}/auth/me/user`, { headers: { Authorization: token } })
        .then((res) => (res.ok ? res.json() : null))
        .then((user) => set({ user: user?.user ?? null }))
        .catch(() => set({ user: null }));
    },
    setSession: (token: string, user: User) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      set({ token, user });
      socket.auth = { token };
      socket.disconnect().connect();
    },
  };
});