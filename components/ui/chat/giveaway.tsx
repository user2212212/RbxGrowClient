"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { rubik } from "@/fonts/index";
import Image from "next/image";
import { API } from "@/lib/env";
import { useSiteStore } from "@/store/site";
import { Button } from "@/components/shadcn/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/shadcn/carousel";
import toast from "react-hot-toast";
import { ArrowIcon, WalletIcon } from "@/components/icons";
import Countdown from "react-countdown";
import { format } from "@/lib/value";

interface GiveawayStore {
  giveaways: Giveaway[];
  getGiveaways: (token?: string | null) => Promise<void>;
  addGiveaway: (g: Giveaway) => void;
  updateParticipants: (u: { id: string; participants?: number }) => void;
  endGiveaway: (u: { id: string; status: string; winner: any; endedAt: string }) => void;
  removeGiveaway: (id: string) => void;
  setJoined: (id: string) => void;
}

const useGiveawayStore = create<GiveawayStore>((set, get) => ({
  giveaways: [],

  getGiveaways: async (token) => {
    try {
      const res = await fetch(`${API}/site/giveaways/list`, {
        headers: token ? { Authorization: token } : undefined,
      });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      set({
        giveaways: (data.giveaways ?? []).map((g: any) => ({ ...g, id: g.id ?? g._id })),
      });
    } catch {
      toast.error("Something went wrong");
    }
  },

  addGiveaway: (g) =>
    get().giveaways.some((x) => x.id === (g.id ?? g._id)) ||
    set({ giveaways: [...get().giveaways, { ...g, id: g.id ?? g._id }] }),

  updateParticipants: (u) =>
    set({
      giveaways: get().giveaways.map((g) =>
        g.id === u.id ? { ...g, participants: u.participants ?? g.participants } : g
      ),
    }),

  endGiveaway: (u) =>
    set({
      giveaways: get().giveaways.map((g) =>
        g.id === u.id ? { ...g, status: u.status, winner: u.winner, endedAt: u.endedAt } : g
      ),
    }),

  removeGiveaway: (id) =>
    set({
      giveaways: get().giveaways.filter((g) => g.id !== id),
    }),

  setJoined: (id) =>
    set({
      giveaways: get().giveaways.map((g) => (g.id === id ? { ...g, joined: true } : g)),
    }),
}));

export default function Giveaways() {
  const { socket, token } = useSiteStore();
  const { giveaways, getGiveaways, addGiveaway, updateParticipants, endGiveaway, removeGiveaway, setJoined } = useGiveawayStore();
  const [api, setApi] = useState<CarouselApi>();
  const [joining, setJoining] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    void getGiveaways(token);
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("giveaways:subscribe");

    const onCreate = (g: Giveaway) => addGiveaway(g);
    const onUpdate = (u: { id: string; participants?: number }) => updateParticipants(u);
    const onEnd = (u: { id: string; status: string; winner: any; endedAt: string }) => {
      endGiveaway(u);
      setTimeout(() => removeGiveaway(u.id), 15000);
    };

    socket.on("giveaway:create", onCreate);
    socket.on("giveaway:update", onUpdate);
    socket.on("giveaway:end", onEnd);

    return () => {
      socket.off("giveaway:create", onCreate);
      socket.off("giveaway:update", onUpdate);
      socket.off("giveaway:end", onEnd);
      socket.emit("giveaways:unsubscribe");
    };
  }, [socket]);

  useEffect(() => {
    if (!api) return;
    api.reInit();
  }, [api, giveaways.length]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const join = async (id: string) => {
    if (joining) return;
    if (!token) return toast.error("You need to be logged in to join");

    setJoining(true);
    try {
      const res = await fetch(`${API}/site/giveaways/${id}/join`, {
        method: "POST",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (!res.ok || !data.success) return toast.error(data?.message);
      setJoined(id);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  if (!giveaways.length) return null;

  return (
    <div className="w-full flex justify-center px-1! py-2">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {giveaways.map((g) => {
            return (
              <CarouselItem key={g.id} className="">
                <div className="w-full h-38 bg-giveaway shadow-sm rounded-[10px] flex flex-col items-center justify-between gap-2.5 p-1.5 px-3 select-none">
                  <div className="w-full relative flex items-center">
                    <span className="flex-1 text-[12px] font-semibold text-grey">
                      {g.participants} Entries
                    </span>
                    <span className="absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold text-grey-secondary whitespace-nowrap">
                      <Countdown
                        date={new Date(g.endsAt).getTime()}
                        renderer={({ hours, minutes, seconds }) => (
                          <>{hours}h {minutes}m {seconds}s</>
                        )}
                      />
                    </span>
                    <span className="flex-1 flex items-center justify-end gap-1 text-[12px] font-semibold text-grey text-right">
                      {!g.starter.anonymous && g.starter.avatar && (
                        <Image src={!g.starter || g.starter.anonymous ? "/icons/anonymouse.webp" : g.starter.avatar ?? "/icons/anonymouse.webp"} alt={g.starter.username} width={18} height={18} className="rounded-full shrink-0" />
                      )}
                      <span className="inline-block max-w-[9ch] truncate">
                        {g.starter.anonymous ? "Anonymous" : g.starter.username}
                      </span>
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => api?.scrollPrev()}
                      className={`h-5.25 w-5.25 text-grey-unfaded shrink-0 ${canScrollPrev ? "opacity-63 cursor-pointer" : "opacity-35 cursor-default"}`}
                    >
                      <ArrowIcon />
                    </button>

                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 relative shrink-0">
                        <Image src={g.item.image} alt={g.item.item} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[15px] font-semibold text-white">
                          {g.item.item}
                        </span>
                        <div className="flex items-center gap-1">
                          <WalletIcon className="w-4 h-4" />
                          <span className="text-[12px] font-semibold text-white">
                            {format(g.item.value)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => api?.scrollNext()}
                      className={`h-5.25 w-5.25 text-grey-unfaded cursor-pointer -scale-x-100 ${canScrollNext ? "opacity-63" : "opacity-20"}`}
                    >
                      <ArrowIcon className="text-grey-unfaded" />
                    </button>
                  </div>

                  <div className="h-9.75 w-full rounded-[13px] flex items-center justify-center px-5">
                    {g.winner ? (
                      g.status?.toUpperCase() === "REFUNDED" ? (
                        <span className="text-[13px] font-medium text-white text-center truncate">
                          There aren't enough participants
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          {g.winner?.avatar && !g.winner?.anonymous && (
                            <div className="relative rounded-full">
                              <Image src={g.winner.avatar} alt={g.winner.username} width={25} height={25} className="rounded-full" />
                            </div>
                          )}
                          <span className="text-[13px] font-medium text-white text-center truncate">
                            {g.winner?.anonymous ? "Anonymous" : g.winner?.username} has won!
                          </span>
                        </div>
                      )
                    ) : (
                      <Button
                        variant={"default"}
                        disabled={g.joined}
                        loading={joining}
                        onClick={() => join(g.id)}
                        className="bg-[linear-gradient(160.96deg,#AE62FF_0%,#DAB8FF_10%,#AE62FF_100%)] border-0 h-9.75 p-0! w-full rounded-[12.5px] font-semibold active:not-aria-[haspopup]:scale-99"
                      >
                        {g.joined ? "Joined" : "Join"}
                      </Button>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}