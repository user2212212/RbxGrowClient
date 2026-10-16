"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header/header";
import Chat from "@/components/ui/chat/chat";
import Loading from "@/components/ui/loading";
import Maintenance from "@/components/ui/maintenance";
import BottomNav from "@/components/ui/bottomnav";
import { ChatIcon } from "@/components/icons/Chat";

const Toaster = dynamic(() => import("react-hot-toast").then((mod) => mod.Toaster), {
  ssr: false,
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { loading, site, user } = useSiteStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    console.log("レオことミラ ことファトマが帰ってきたわよ あんたたち")
    console.log("next.js-@16.3.5 fastify-@5.12.5")
    console.log("BUILD-1651102513")
  }, [user])  

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    ["message", "error"].forEach((key) => {
      const value = params.get(key);
      if (!value) return;

      key === "message" ? toast.success(value, { duration: 4000 }) : toast.error(value, { duration: 4000 });

      params.delete(key);
    });

    if (searchParams.has("message") || searchParams.has("error")) {
      router.replace(`?${params}`, { scroll: false });
    }
  }, [searchParams, router]);

  if (site?.settings.maintenance) {
    const bypass = user?.ranks.some((id) => ["ALL", "BYPASS_MAINTENANCE"].some((p) => site?.ranks.find((r) => r._id === id)?.permissions.includes(p)));
    if (!bypass) return <Maintenance />;
  }

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 2500,
          style: {
            color: "#E4E2F2",
            padding: "10px 15px",
            fontSize: "14px",
            borderRadius: "12px",
            border: "1.8px solid transparent",
            background: "#111026"
          },
          iconTheme: {
            primary: "linear-gradient(135deg, #C58EFE 0%, #9837FF 100%)",
            secondary: "#121127",
          },
        }}
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <Sidebar className="hidden md:flex" />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden pb-[calc(78px+env(safe-area-inset-bottom,0px))] md:pb-0">
              <main
                className="flex-1 overflow-y-auto rounded-none border-0 mt-0 ml-0 md:rounded-tl-[35px] md:border-t md:border-l md:border-secondary md:mt-2 md:ml-2"
                style={{ background: "rgba(20, 19, 43, 0.4)" }}
              >
                {children}
              </main>
              <Chat className="hidden xl:flex" />
            </div>
            <BottomNav className="md:hidden" />
          </div>

          <div
            onClick={() => setChatOpen(false)}
            className={cn(
              "fixed inset-x-0 bottom-0 top-20 z-40 hidden transition-opacity md:block xl:hidden",
              chatOpen ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />

          <div
            className={cn(
              "fixed bottom-0 right-0 top-20 z-50 hidden transition-transform duration-300 md:flex xl:hidden",
              chatOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <button
              type="button"
              aria-label="chat"
              onClick={() => setChatOpen((o) => !o)}
              className="absolute bottom-12 right-full flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-xl bg-wallet text-icon-secondary"
            >
              <ChatIcon className="h-6 w-6" />
            </button>

            <Chat className="flex h-full" />
          </div>
        </>
      )}
    </>
  );
}