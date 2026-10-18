"use client"

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { API } from "@/lib/env";
import { useSiteStore } from "@/store/site";
import { Button } from "@/components/shadcn/button";
import { Slider } from "@/components/shadcn/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip";
import { format } from "@/lib/value";
import { CoinflipIcon, WalletIcon, CrownIcon, DeleteIcon, PlayIcon } from "@/components/icons";
import { Coinflip, CoinflipUser } from "@/types/coinflip";
import CoinflipViewModal from "../modals/viewcoinflip";
import { EyeIcon } from "@/components/icons";
import InventoryModal, { InventorySecondAction } from "@/components/modals/inventory";
import UserProfile from "../modals/profile";

interface CoinflipStore {
  coinflips: Coinflip[];
  loading: boolean;
  getCoinflips: (token: string | null, errors: { load: string; generic: string }) => Promise<void>;
  addCoinflip: (cf: Coinflip) => void;
  updateCoinflip: (cf: Coinflip) => void;
  removeCoinflip: (id: string) => void;
}

const useCoinflipStore = create<CoinflipStore>((set, get) => ({
  coinflips: [],
  loading: true,

  getCoinflips: async (token, errors) => {
    try {
      const res = await fetch(`${API}/games/coinflip/matches`, {
        headers: token ? { Authorization: token } : undefined,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data?.message ?? errors.load);
        set({ loading: false });
        return;
      }
      set({ coinflips: data.coinflips ?? [], loading: false });
    } catch {
      toast.error(errors.generic);
      set({ loading: false });
    }
  },

  addCoinflip: (cf) => set({ coinflips: [cf, ...get().coinflips] }),

  updateCoinflip: (cf) =>
    set({
      coinflips: get().coinflips.map((c) => (c._id === cf._id ? cf : c)),
    }),

  removeCoinflip: (id) =>
    set({ coinflips: get().coinflips.filter((c) => c._id !== id) }),
}));

function CoinflipRow({
  cf,
  isOwn,
  onJoin,
  onView,
  onDelete,
}: {
  cf: Coinflip;
  isOwn: boolean;
  onJoin: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("Coinflip");
  const [rolled, setRolled] = useState(!!cf.winner);
  const locale = useLocale()
  const rarities = useSiteStore((s) => s.site!.rarities);

  const [sheetReady, setSheetReady] = useState(false);

  useEffect(() => {
    const winnerSide = cf.winner?.side;
    if (!winnerSide || rolled) return;
    let cancelled = false;
    const img = new window.Image();
    img.src = `/coins/${winnerSide.toLowerCase()}_sprite.png`;
    img
      .decode()
      .then(() => { if (!cancelled) setSheetReady(true); })
      .catch(() => { if (!cancelled) setRolled(true); });
    return () => { cancelled = true; };
  }, [cf.winner?.side, rolled]);

  const items = cf.winner
    ? [...cf.players.creator.items, ...(cf.players.joiner?.items ?? [])]
    : cf.players.creator.items;
  const shownItems = items.slice(0, 4);
  const extraItems = items.length - shownItems.length;

  const p1 = cf.players.creator.user;
  const p2 = cf.players.joiner?.user ?? cf.winner?.user ?? null;

  const oppositeSide = cf.players.creator.side === "HEADS" ? "TAILS" : "HEADS";

  const { minimumValue: min, maximumValue: max } = cf.requirement;
  const range =
    min != null && max != null
      ? `${format(min, locale)} - ${format(max, locale)}`
      : min != null
        ? `${format(min, locale)}+`
        : max != null
          ? t("upTo", { value: format(max, locale) })
          : null;

  const slot = (u: CoinflipUser | null | undefined, right = false) =>
    !u ? (
      <div className="relative w-9 h-9 shrink-0">
        <Image
          src={`/coins/${oppositeSide.toLowerCase()}.webp`}
          alt={t(`sides.${oppositeSide}`)}
          fill
          className="object-contain ml-0.75"
        />
      </div>
    ) : (
      <div className="relative w-9.5 h-9.5 shrink-0">
        {rolled && cf.winner && u._id === cf.winner.user?._id && (
          <motion.div
            className={`absolute -top-2 w-4.5 h-4 z-10 pointer-events-none ${right ? "-right-0.5 rotate-25" : "-left-0.5 -rotate-25"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CrownIcon className="w-full h-full" />
          </motion.div>
        )}
        <div className="relative w-9.5 h-9.5 rounded-full overflow-hidden shrink-0 cursor-pointer hover:opacity-85 transition-opacity duration-200">
          <UserProfile userid={u._id}>
            <Image
              src={u.anonymous ? "/icons/anonymouse.webp" : u.avatar ?? "/icons/anonymouse.webp"}
              alt=""
              fill
              className={`object-cover transition-opacity duration-500 ${rolled && cf.winner && u._id !== cf.winner.user?._id ? "opacity-40" : ""}`}
            />
          </UserProfile>
        </div>
      </div>
    );

  return (
    <div className="w-full bg-foreground rounded-[9px] px-3 sm:px-5.25 py-3 lg:py-0 lg:h-17.5 grid grid-cols-2 lg:grid-cols-[110px_minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-3 lg:gap-x-6">
      <div className="order-1 lg:order-none flex flex-row items-center justify-start gap-2.5 w-27.5">
        {slot(p1)}
        <span className="text-[14.5px] font-bold text-[#BCC0D0]/60 shrink-0">vs</span>
        {slot(p2, true)}
      </div>

      <div className="order-3 lg:order-none flex flex-row items-center justify-start min-w-0">
        {shownItems.map((item, i) => (
          <Tooltip key={item._id}>
            <TooltipTrigger asChild>
              <div
                className="relative w-9.5 h-9.5 sm:w-11.5 sm:h-11.5 rounded-full bg-[#252839] shrink-0 overflow-hidden box-border cursor-pointer"
                style={{ marginLeft: i === 0 ? 0 : -9 }}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-contain blur-[17px]"
                />
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-contain blur-[17px]"
                />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle 45px at 10% 100%, ${rarities.find((r) => r._id.toLowerCase() === item.rarity?.toLowerCase())?.color
                      } 5%, rgba(255, 255, 255, 0) 100%)`,
                    padding: "1.5px",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
                <Image
                  src={item.image}
                  alt={item.item}
                  width={25}
                  height={25}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain w-6 h-6 sm:w-7 sm:h-7"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {item.item}
            </TooltipContent>
          </Tooltip>
        ))}
        {extraItems > 0 && (
          <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shrink-0" style={{ marginLeft: -5 }}>
            <span className="text-[14px] sm:text-[16px] font-bold bg-[linear-gradient(113.96deg,#AE62FF_0%,#DAB8FF_50%,#AE62FF_100%)] bg-clip-text text-transparent">+{extraItems}</span>
          </div>
        )}
      </div>

      <div className="order-2 lg:order-none justify-self-end flex flex-row items-center justify-end gap-3 lg:gap-6">
        <div className="lg:w-6 flex items-center justify-center shrink-0">
          {!cf.winner && cf.players.joiner && (
            <span className="text-[13px] font-semibold text-white whitespace-nowrap">3s</span>
          )}
        </div>

        <div className="lg:w-32 flex flex-col items-end lg:items-center justify-center shrink-0">
          <div className="flex flex-row items-center justify-center gap-1.25">
            <WalletIcon className="w-4.5 h-3.5 text-purple-secondary shrink-0" />
            <span className="text-[16px] leading-6 font-bold text-white whitespace-nowrap">
              {format(cf.players.creator.totalValue, locale)}
            </span>
          </div>
          {range && (
            <span className="text-[12px] font-medium text-grey-unfaded whitespace-nowrap">
              {range}
            </span>
          )}
        </div>
      </div>

      <div className="order-4 lg:order-none justify-self-end lg:w-40 flex flex-row items-center justify-end gap-2.5 shrink-0">
        {cf.winner && (
          <div className="relative w-[42px] h-[42px] shrink-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
              <Image
                src={`/coins/${cf.winner.side.toLowerCase()}.webp`}
                alt={t(`sides.${cf.winner.side}`)}
                fill
                className={`object-contain scale-[0.533] ${rolled ? "" : "opacity-0"
                  }`}
              />
              {!rolled && sheetReady && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="coin-roll-y"
                    onAnimationEnd={(e) => {
                      if (e.target === e.currentTarget) setRolled(true);
                    }}
                  >
                    <div
                      className="coin-roll-x"
                      style={{ backgroundImage: `url(/coins/${cf.winner.side.toLowerCase()}_sprite.png)` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isOwn && !cf.winner && (
          <Button
            size="icon-sm"
            variant="icon"
            className="bg-secondary-input-bg!"
            style={{ backgroundImage: "linear-gradient(180deg, #FF8989 0%, #FF3737 100%)" }}
            onClick={() => onDelete(cf._id)}
          >
            <DeleteIcon />
          </Button>
        )}

        {!isOwn && !cf.winner && (
          <InventoryModal
            data={{
              action: {
                button: t("joinFlip"),
                endpoint: `${API}/games/coinflip/${cf._id}/join`,
                secondaction: InventorySecondAction.AutoSelect,
                secondactionData: {
                  min: cf.requirement.minimumValue,
                  max: cf.requirement.maximumValue,
                },
                body: (items) => ({ items }),
                closeComplete: true
              },
              header: {
                maximumItems: cf.requirement?.maximumItems || undefined,
                minimumValue: cf.requirement.minimumValue,
                maximumValue: cf.requirement.maximumValue
              },
              content: (
                <div className="flex items-center gap-2 md:p-2">
                  {["HEADS", "TAILS"].map((s) => (
                    <div
                      key={s}
                      className={`rounded-full flex items-center justify-center transition-opacity ${s === (cf.players.creator.side === "HEADS" ? "TAILS" : "HEADS") ? "" : "scale-97 opacity-40 "}`}                      >
                      <Image src={`/coins/${s.toLowerCase()}.webp`} alt={t(`sides.${s}`)} width={40} height={40} />
                    </div>
                  ))}
                </div>
              ),
            }}>
            <Button
              size="icon-sm"
              onClick={() => onJoin(cf._id)}
            >
              <PlayIcon className="w-3.75 h-3.75" />
            </Button>
          </InventoryModal>
        )}

        <CoinflipViewModal cf={cf}>
          <Button
            size="icon-sm"
            variant="icon"
            className="bg-secondary-input-bg!"
          >
            <EyeIcon className="w-4 h-3.25 text-grey" />
          </Button>
        </CoinflipViewModal>
      </div>
    </div>
  );
}

export default function CoinflipLayout() {
  const t = useTranslations("Coinflip");
  const tc = useTranslations("Common");
  const { socket, token, user } = useSiteStore();
  const { coinflips, getCoinflips, addCoinflip, updateCoinflip, removeCoinflip } =
    useCoinflipStore();
  const [side, setSide] = useState("HEADS");

  useEffect(() => {
    ["heads", "tails"].forEach((s) => {
      const img = new window.Image();
      img.src = `/coins/${s}_sprite.png`;
      img.decode().catch(() => { });
    });
  }, []);

  useEffect(() => {
    void getCoinflips(token ?? null, { load: t("loadError"), generic: tc("somethingWentWrong") });
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const onCreate = (cf: Coinflip) => addCoinflip(cf);
    const onUpdate = (cf: Coinflip) => updateCoinflip(cf);
    const onCancel = (id: string) => removeCoinflip(id);

    socket.emit("games:subscribe", "coinflip");

    socket.on("coinflip:create", onCreate);
    socket.on("coinflip:update", onUpdate);
    socket.on("coinflip:cancel", onCancel);

    return () => {
      socket.emit("games:unsubscribe", "coinflip");
      socket.off("coinflip:create", onCreate);
      socket.off("coinflip:update", onUpdate);
      socket.off("coinflip:cancel", onCancel);
    };
  }, [socket, addCoinflip, updateCoinflip, removeCoinflip]);

  const stats = useMemo(
    () => ({
      total: coinflips.length,
      joinable: coinflips.filter((c) => !c.endedAt).length,
    }),
    [coinflips]
  );

  const handleDelete = async (id: string) => {
    try {
      if (!token) return;
      const res = await fetch(`${API}/games/coinflip/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (!res.ok || !data.success) return toast.error(data?.message);
    } catch {
      toast.error(tc("somethingWentWrong"));
    }
  };

  return (
  <div className="flex flex-col items-center gap-5 sm:gap-7.5 p-3 sm:p-5 w-full h-full select-none overflow-y-auto overflow-x-hidden scrollbar-none">      <div className="flex flex-row flex-wrap justify-between items-center gap-y-3 gap-x-4 w-full select-none">
        <div className="flex flex-row items-center gap-2.75 ml-1 sm:ml-2">
          <CoinflipIcon className="h-6 w-6" active={true} />
          <span className="text-[18px] sm:text-[22px] font-medium text-white">
            {t("title")}
          </span>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
          <span className="text-[12px] sm:text-[13px] font-medium text-white/80">
            {t("totalFlips", { count: stats.total })}
          </span>
          <div className="w-px h-8 sm:h-10.25 bg-[#27272A] rounded-full hidden sm:block" />
          <span className="text-[12px] sm:text-[13px] font-medium text-purple-primary/80">
            {t("joinableFlips", { count: stats.joinable })}
          </span>
          <InventoryModal
            data={{
              action: {
                button: t("createFlip"),
                endpoint: `${API}/games/coinflip/create`,
                body: (items) => ({ items, side }),
                closeComplete: true
              },
              content: (
                <div className="flex items-center gap-4 md:p-2">
                  <div className="flex items-center gap-2.5">
                    {["HEADS", "TAILS"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-opacity ${side === s ? "" : "scale-97 opacity-40 hover:opacity-70"
                          }`}
                      >
                        <Image src={`/coins/${s.toLowerCase()}.webp`} alt={t(`sides.${s}`)} width={40} height={40} />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5">
                  </div>
                </div>
              ),
            }}>
            <Button size="default" className="rounded-[15px] p-3 sm:p-3.5 h-10 sm:h-11.25 text-[13px]! sm:text-[14px]!">
              {t("createFlip")}
            </Button>
          </InventoryModal>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <AnimatePresence initial={false}>
          {[...coinflips]
            .sort((a, b) => b.players.creator.totalValue - a.players.creator.totalValue)
            .map((cf) => (
              <motion.div
                key={cf._id}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CoinflipRow
                  cf={cf}
                  isOwn={user?._id == cf.players.creator.user?._id}
                  onJoin={(() => { })}
                  onView={(() => { })}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}