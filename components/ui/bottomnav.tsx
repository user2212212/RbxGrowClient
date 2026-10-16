"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/ui/sidebar";
import Chat from "@/components/ui/chat/chat";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from "@/components/shadcn/drawer";
import Image from "next/image";
import { MenuIcon } from "@/components/icons/Menu";
import { ChatIcon } from "@/components/icons/Chat";
import { useSiteStore } from "@/store/site";

export default function BottomNav({ className }: { className?: string }) {
  const { user } = useSiteStore();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [menuKey, setMenuKey] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        pendingRef.current = null;
        setActive(null);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (
        e.clientY < 80 ||
        navRef.current?.contains(target) ||
        target.closest("[data-vaul-drawer]") ||
        document.querySelector('[role="dialog"][data-state="open"]:not([data-vaul-drawer])')
      ) return;
      handleOpenChange(active, false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active]);

  const handleOpenChange = (key: string, open: boolean) => {
    if (open) {
      if (closingRef.current) {
        pendingRef.current = key;
        return;
      }
      if (key === "menu") setMenuKey((k) => k + 1);
      if (key === "chat") setChatKey((k) => k + 1);
      setActive(key);
    } else {
      closingRef.current = true;
      setActive(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        closingRef.current = false;
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next) {
          if (next === "menu") setMenuKey((k) => k + 1);
          if (next === "chat") setChatKey((k) => k + 1);
          setActive(next);
        }
      }, 350);
    }
  };

  return (
    <div
      ref={navRef}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 bg-header-mobile w-full h-19.5 shrink-0 flex items-center justify-between px-12 gap-2.5",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 h-1.25 w-15 -translate-x-1/2 rounded-t-[10px] bg-purple-primary transition-all",
          active !== null || pathname === "/me" ? "opacity-100" : "opacity-0"
        )}
        style={{
          left: active === "menu" ? 66 : active === "chat" ? "calc(100% - 66px)" : "50%",
        }}
      />

      <Drawer
        direction="left"
        modal={false}
        shouldScaleBackground={false}
        noBodyStyles
        open={active === "menu"}
        onOpenChange={(open) => handleOpenChange("menu", open)}
      >
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="relative flex h-9 w-9 items-center justify-center cursor-pointer"
          >
            <MenuIcon
              className={cn(
                "h-9 w-9 transition-colors",
                active === "menu" ? "text-purple-primary" : "text-icon-secondary"
              )}
            />
          </button>
        </DrawerTrigger>
        <DrawerContent
          key={menuKey}
          className="md:hidden"
          style={{ top: 80, bottom: "calc(78px + env(safe-area-inset-bottom, 0px))" }}
          overlayStyle={{ top: 80, bottom: "calc(78px + env(safe-area-inset-bottom, 0px))" }}
        >
          <Sidebar className="flex h-full" />
        </DrawerContent>
      </Drawer>

      <button
        type="button"
        aria-label="Profile"
        onClick={() => router.push("/me")}
        className="relative flex h-9 w-9 items-center justify-center cursor-pointer"
      >
        { user &&
        (
        <Image src={user!.avatar} width={35} height={35} alt="user" className="rounded-full" />

        )}
      </button>

      <Drawer
        direction="right"
        modal={false}
        shouldScaleBackground={false}
        noBodyStyles
        repositionInputs={false}
        open={active === "chat"}
        onOpenChange={(open) => handleOpenChange("chat", open)}
      >
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Open chat"
            className="relative flex h-9 w-9 items-center justify-center cursor-pointer"
          >
            <ChatIcon
              className={cn(
                "h-7 w-7 transition-colors",
                active === "chat" ? "text-purple-primary" : "text-icon-secondary"
              )}
            />
          </button>
        </DrawerTrigger>
        <DrawerContent
          key={chatKey}
          className="md:hidden"
          style={{
            top: 80,
            bottom: "calc(78px + env(safe-area-inset-bottom, 0px))",
            width: "100%",
            maxWidth: "100%",
          }}
          overlayStyle={{ top: 80, bottom: "calc(78px + env(safe-area-inset-bottom, 0px))" }}
        >
          <Chat className="flex h-full w-full" />
        </DrawerContent>
      </Drawer>
    </div>
  );
}