"use client"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { format } from "@/lib/value"
import { CrownIcon, WalletIcon } from "@/components/icons"
import UserProfile from "@/components/modals/profile"
import { ItemCard } from "@/components/ui/others/item"
import { Coinflip } from "@/types/coinflip"

type Side = {
  user: Coinflip["players"]["creator"]["user"] | null | undefined
  side: "HEADS" | "TAILS"
  items: Coinflip["players"]["creator"]["items"]
  value: number
}

function CoinRoll({ winSide, onDone }: { winSide: string; onDone: () => void }) {
  const [sheetReady, setSheetReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const img = new window.Image()
    img.src = `/coins/${winSide.toLowerCase()}_sprite.png`
    img
      .decode()
      .then(() => {
        if (!cancelled) setSheetReady(true)
      })
      .catch(() => {
        if (!cancelled) onDone()
      })
    return () => {
      cancelled = true
    }
  }, [winSide, onDone])

  if (!sheetReady) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="coin-roll-y"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) onDone()
        }}
      >
        <div
          className="coin-roll-x"
          style={{ backgroundImage: `url(/coins/${winSide.toLowerCase()}_sprite.png)` }}
        />
      </div>
    </div>
  )
}

function View({ cf }: { cf: Coinflip }) {
  // already finished when opened -> just the result. Winner arrives while open -> roll plays first.
  const [rolled, setRolled] = useState(!!cf.winner)

  const { creator, joiner } = cf.players
  const joinerSide = creator.side === "HEADS" ? "TAILS" : "HEADS"
  const winSide = cf.winner?.side
  const done = rolled && !!winSide

  const sides = useMemo<Side[]>(
    () => [
      { user: creator.user, side: creator.side, items: creator.items, value: creator.totalValue },
      {
        user: joiner?.user ?? (winSide === joinerSide ? cf.winner?.user : null),
        side: joinerSide,
        items: joiner?.items ?? [],
        value: joiner?.totalValue ?? 0,
      },
    ],
    [creator, joiner, joinerSide, winSide, cf.winner]
  )

  const total = sides[0].value + sides[1].value
  const percentages = useMemo(
    () => sides.map((s, i) => (total ? (s.value / total) * 100 : i === 0 ? 100 : 0)),
    [sides, total]
  )

  return (
    <>
      <DialogTitle className="sr-only">Coinflip</DialogTitle>

      <DialogClose asChild>
        <button
          type="button"
          className="absolute right-4 top-4 z-10 flex items-center justify-center w-7.75 h-7.75 rounded-[7px] bg-wallet cursor-pointer shrink-0 leading-none"
          aria-label="Close"
        >
          <X className="w-4.25 h-4.25 text-grey" />
        </button>
      </DialogClose>

      <div className="shrink-0 bg-foreground grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-3 sm:px-6 pt-12 pb-4">
        {sides.map((s, i) => (
          <div key={i} className={`flex ${i ? "order-3 justify-end" : "order-1 justify-start"}`}>
            {s.user ? (
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0">
                  {done && s.side === winSide && (
                    <CrownIcon
                      className={`absolute -top-3 w-5 h-4.5 z-10 ${i ? "-right-1 rotate-25" : "-left-1 -rotate-25"}`}
                    />
                  )}
                  <div
                    className={`relative size-full rounded-full overflow-hidden transition-opacity duration-500 ${done && s.side !== winSide ? "opacity-40" : ""}`}
                  >
                    <UserProfile userid={s.user._id}>
                      <Image
                        src={s.user.anonymous ? "/icons/anonymouse.webp" : s.user.avatar ?? "/icons/anonymouse.webp"}
                        alt={s.user.anonymous ? "Anonymous player" : s.user.username}
                        fill
                        className="object-cover"
                      />
                    </UserProfile>
                  </div>
                  <Image
                    src={`/coins/${s.side.toLowerCase()}.webp`}
                    alt={s.side}
                    width={22}
                    height={22}
                    className="absolute -bottom-1 -right-1"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-medium text-white truncate max-w-28">
                    {s.user.anonymous ? "Anonymous" : s.user.username}
                  </p>
                  <p
                    aria-live="polite"
                    className={`text-[12px] font-semibold ${done && s.side === winSide ? "text-purple-secondary" : "text-grey-unfaded"}`}
                  >
                    {done ? (s.side === winSide ? "Won" : "Lost") : ""}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-[14px] font-medium text-grey-unfaded">Waiting...</span>
            )}
          </div>
        ))}

        <div className="order-2 flex flex-col items-center gap-2">
          <div className="relative size-36">
            {winSide && !rolled ? (
              <CoinRoll winSide={winSide} onDone={() => setRolled(true)} />
            ) : (
              <Image
                src={`/coins/${(winSide ?? joinerSide).toLowerCase()}.webp`}
                alt={winSide ?? joinerSide}
                fill
                className={`object-contain scale-[0.533] ${winSide ? "" : "opacity-40"}`}
              />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <WalletIcon className="w-3.75 h-3.75 shrink-0" />
            <span className="text-purple-gradient text-[14px] font-[420]">{format(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2">
        {sides.map((s, i) => (
          <div key={i} className="flex flex-col min-h-0 pt-2.5">
            <div className="flex items-center justify-between px-3 sm:px-6 pb-2.5 text-[14px] leading-3.75">
              <div className="flex items-center gap-1.5">
                <WalletIcon className="w-3.75 h-3.75 shrink-0" />
                <span className="text-purple-gradient font-[420]">{format(s.value)}</span>
              </div>
              <span className="text-grey-unfaded text-[12px] font-medium">{s.items.length} items</span>
              <span className="text-white font-[420]">{percentages[i].toFixed(2)}%</span>
            </div>

            <div
              className={`flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pb-3 transition-opacity duration-500 ${done && s.side !== winSide ? "opacity-40" : ""}`}
            >
              {s.items.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {s.items.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="h-full flex items-center justify-center text-[13px] text-grey-unfaded">
                  Waiting for an opponent
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function CoinflipViewModal({ cf, children }: { cf: Coinflip; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[calc(100vw-1rem)] sm:w-230 h-[min(92vh,636px)] sm:h-[min(85vh,636px)] max-w-none! p-0 bg-header-mobile rounded-[10px] flex flex-col gap-0 overflow-hidden"
      >
        <View cf={cf} />
      </DialogContent>
    </Dialog>
  )
}