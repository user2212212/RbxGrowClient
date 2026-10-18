"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useLocale, useTranslations } from "next-intl";
import { US, DE, JP } from "country-flag-icons/react/3x2";
import { usePathname, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shadcn/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { HomeIcon, DropdownIcon, CoinflipIcon, UpgraderIcon, MarketplaceIcon, FairnessIcon, SupportIcon, HelpIcon, RefIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";

const games = [
  { key: "coinflip", href: "/", icon: CoinflipIcon },
  { key: "upgrader", href: "/upgrader", icon: UpgraderIcon },
];

const more = [
  { key: "market", href: "/marketplace", icon: MarketplaceIcon },
  { key: "fairness", href: "/fairness", icon: FairnessIcon },
  { key: "support", href: "/support", icon: SupportIcon },
  { key: "help", href: "/help", icon: HelpIcon },
];

const languages: Record<string, { label: string; Flag: React.ComponentType<any> }> = {
  en: { label: "English", Flag: US },
  de: { label: "Deutsch", Flag: DE },
  ja: { label: "日本語", Flag: JP },
};

function RoundFlag({ code }: { code: string }) {
  const { Flag } = languages[code];
  return (
    <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-full">
      <Flag preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" />
    </span>
  );
}

const useSidebarStore = create(
  persist<{
    gamesOpen: boolean;
    moreOpen: boolean;
    setGamesOpen: (open: boolean) => void;
    setMoreOpen: (open: boolean) => void;
  }>(
    (set) => ({
      gamesOpen: true,
      moreOpen: true,
      setGamesOpen: (open) => set({ gamesOpen: open }),
      setMoreOpen: (open) => set({ moreOpen: open }),
    }),
    { name: "sidebar" }
  )
);

export default function Sidebar({ className }: { className?: string }) {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();
  const [, startTransition] = useTransition();
  const { site, user } = useSiteStore();
  const gamesOpen = useSidebarStore((state) => state.gamesOpen);
  const setGamesOpen = useSidebarStore((state) => state.setGamesOpen);
  const moreOpen = useSidebarStore((state) => state.moreOpen);
  const setMoreOpen = useSidebarStore((state) => state.setMoreOpen);

  const [rank, setRank] = useState<any>(null);
  const [rankProgress, setRankProgress] = useState<number>(0);

  const changeLanguage = (value: string) => {
    startTransition(() => {
      router.replace(path, { locale: value });
      router.refresh();
    });
  };

  useEffect(() => {
    if (!user || !site) {
      setRank(null);
      setRankProgress(0);
      return;
    }

    const hasXpReq = (r: any) => r.requirements?.xp !== null && r.requirements?.xp !== undefined;

    const myranks = site.ranks
      .filter((r: any) => user.ranks.includes(r._id) && hasXpReq(r))
      .sort((a: any, b: any) => a.priority - b.priority);
    const currentRank = myranks[myranks.length - 1] ?? null;

    const nextRank = site.ranks
      .filter(hasXpReq)
      .filter((r: any) => r.priority > (currentRank?.priority ?? -Infinity))
      .sort((a: any, b: any) => a.priority - b.priority)[0] ?? null;


    const progress = nextRank
      ? nextRank.requirements.xp > 0
        ? Math.min(100, Math.max(0, Math.round((user.xp / nextRank.requirements.xp) * 100)))
        : 100
      : 100;

    setRank(nextRank ?? currentRank);
    setRankProgress(progress);
  }, [user, site]);

  return (
    <div className={cn("bg-sidebar flex h-full w-67.25 shrink-0 flex-col items-center justify-between gap-2.5 px-5 py-7 select-none overflow-y-auto overflow-x-hidden scrollbar-none", className)}>
      <div className="flex w-58.25 flex-col items-center gap-3.75">
        <div className="flex h-17 w-61.25 items-center justify-center gap-3.5 py-2.5 hover:opacity-80 transition-opacity duration-200 cursor-pointer" onClick={() => router.push("/")}>
          <Image src="/logos/main.png" alt="RbxGrow" width={210} height={60} loading="eager" />
        </div>

        <button className="bg-foreground hover:bg-foreground/75 flex w-full items-center gap-2.5 rounded-[10px] p-3.75 transition-colors duration-200 cursor-pointer" onClick={() => router.push("/")}>
          <HomeIcon active={path === "/"} className="h-4 w-4 shrink-0" />
          <span className={`font-semibold text-xs ${path === "/" ? "text-white" : "text-grey"}`}>{t("home")}</span>
        </button>

        <Collapsible
          open={gamesOpen}
          onOpenChange={setGamesOpen}
          className="w-full rounded-[10px] bg-foreground p-3.75"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold tracking-wide text-grey">
              {t("games")}
            </span>
            <DropdownIcon
              className={`h-2.5 w-2.5 text-grey transition-transform duration-200 ${gamesOpen ? "" : "rotate-180"
                }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col gap-3.5 overflow-hidden pt-3.75 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            {games.map(({ key, href, icon: Icon }) => {
              const active = path === href || (href === "/coinflip" && path === "/");
              return (
                <button key={key} className="flex w-full items-center gap-2.5 hover:opacity-80 transition-opacity duration-100 cursor-pointer" onClick={() => router.push(href)} >
                  <Icon className="h-4 w-4 shrink-0" active={active} />
                  <span
                    className={`text-xs font-bold ${active ? "text-white" : "text-grey"}`} >
                    {t(`nav.${key}`)}
                  </span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={moreOpen}
          onOpenChange={setMoreOpen}
          className="w-full rounded-[10px] bg-foreground p-3.5"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold tracking-wide text-grey">
              {t("more")}
            </span>
            <DropdownIcon
              className={`h-2.5 w-2.5 text-grey transition-transform duration-200 ${moreOpen ? "" : "rotate-180"
                }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-3.5 overflow-hidden pt-3.75 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            {more.map(({ key, href, icon: Icon }) => {
              const active = path === href;
              return (
                <button key={key} className="flex w-full items-center gap-2.5 hover:opacity-80 transition-opacity duration-100 cursor-pointer" onClick={() => router.push(href)} >
                  <Icon className="h-4 w-4" active={active} />
                  <span
                    className={`text-xs font-bold ${active ? "text-white" : "text-grey"}`} >
                    {t(`nav.${key}`)}
                  </span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
        {user && rank && (
          <div className="flex w-full flex-col items-center justify-center gap-2.5 rounded-[10px] px-3.5 py-2.5">
            <div className="flex w-54.25 flex-col items-center gap-1.25">
              <div className="flex w-54.25 items-center justify-between py-0.75 px-0.5">
                <div className="flex items-center gap-1.5">
                  <Image src={rank.icon} alt="RANK" height={17} width={17} />
                  <span className="text-[11px] font-bold text-white">
                    {rank._id}
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(to right, ${rank.color.starts}, ${rank.color.ends})` }}
                >
                  {rankProgress}%
                </span>
              </div>

              <div className={`${rankProgress > 1 ? "h-4" : "h-3.25"} w-54 overflow-hidden rounded-full bg-progress p-0.75`}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(rankProgress)))}%`,
                    background: `linear-gradient(to right, ${rank.color.starts}, ${rank.color.ends})`,
                  }}
                />
              </div>
              <div className="w-53 mt-[-5.35px]">
                 <span className="text-[10px] text-grey-faded/50 font-medium">{user.ranks.includes(rank._id) ? t("currentRank") : t("nextRank")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-4 px-0.5">
        <Select value={locale} onValueChange={changeLanguage}>
          <SelectTrigger className="bg-foreground flex h-11.5! w-full items-center justify-between gap-2 rounded-[9px] border-0 p-2.5 px-3 text-[14px] font-[510] text-white cursor-pointer transition-colors duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languages).map(([code, { label }]) => (
              <SelectItem key={code} value={code} className="cursor-pointer">
                <span className="flex items-center gap-2.5">
                  <RoundFlag code={code} />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}