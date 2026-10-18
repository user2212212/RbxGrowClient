"use client"
import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/shadcn/dialog"
import { API } from "@/lib/env"
import { useSiteStore } from "@/store/site"
import { getRank, getRankColor } from "@/lib/ranks"
import { X } from "lucide-react"
import { format } from "@/lib/value"
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/shadcn/button"
import { Spinner } from "@/components/shadcn/spinner"
import toast from "react-hot-toast"
import InventoryModal from "./inventory"

interface UserProfileProps {
  userid: string
  children: React.ReactNode
}

export function UserProfile({ userid, children }: UserProfileProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [profile, setProfile] = React.useState<any>(null)
  const locale = useLocale();
  const t = useTranslations("Profile");
  const tc = useTranslations("Common");
  const { site, token, user } = useSiteStore()

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${API}/users/user/${userid}/`, {
      headers: token ? { Authorization: token } : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setOpen(false)
          toast.error(data.message)
          return
        }
        setProfile(data.user)
      })
      .catch(() => {
        toast.error(tc("somethingWentWrong"))
        setOpen(false)
      })
      .finally(() => setLoading(false))
  }, [open, userid])

  const rank = profile ? getRank(site?.ranks, profile.ranks) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="w-[min(90vw,380px)] h-84 sm:w-95 sm:h-84 max-w-95! p-6 bg-header-mobile rounded-[14px] flex flex-col items-center overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 cursor-pointer"
          aria-label={t("close")}
        >
          <X className="w-4 h-4 text-grey" />
        </button>

        <div className="flex-1 w-full flex flex-col items-center justify-start gap-5 pt-2">
          {loading || !profile ? (
            <div className="flex-1 flex items-center justify-center text-purple-secondary text-sm">
              <Spinner className="size-11" />
            </div>
          ) : (
            <>
              <div className="flex flex-row items-center gap-3 w-full">
                <div className="w-19 h-19 rounded-full overflow-hidden relative shrink-0 border-2 border-purple-secondary">
                  <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                </div>

                <div className="flex flex-col justify-center items-start min-w-0 flex-1 gap-1">
                  <div className="flex items-center gap-1 min-w-0 w-full">
                    {rank?.icon && <Image src={rank.icon} alt="" width={16} height={16} className="shrink-0" />}
                    <span
                      className="text-[18px] font-semibold leading-5.5 truncate max-w-full"
                      style={rank ? getRankColor(rank.color) : { color: "#fff" }}
                    >
                      {profile.username}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-medium text-grey whitespace-nowrap">
                      {t("joined", { date: new Date(profile.joined).toLocaleDateString(locale === "en" ? "en-US" : locale, { month: "long", day: "numeric", year: "numeric" }) })}
                    </span>
                    {(profile.settings?.anonymousMode || profile.settings?.hiddenStats) && (
                      <span className="text-[10px] font-medium text-grey whitespace-nowrap">
                        {profile.settings?.anonymousMode ? t("hiddenProfile") : t("hiddenStats")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                {[
                  { key: "wagered", value: profile.stats?.wager ?? "??" },
                  { key: "profit", value: profile.stats?.profit ?? "??" },
                  { key: "tipSent", value: profile.stats?.won ?? "??" },
                  { key: "tipReceived", value: profile.stats?.lost ?? "??" },
                ].map((stat) => (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center justify-center gap-1 h-14 rounded-[10px] bg-[rgba(15,14,37,0.8)]"
                  >
                    <span
                      className="text-[17px] font-semibold leading-5"
                      style={{
                        background: "linear-gradient(113.96deg, #AE62FF 0%, #DAB8FF 50%, #AE62FF 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {format(stat.value, locale)}
                    </span>
                    <span className="text-[10px] font-bold leading-3 text-grey-faded">
                      {t(stat.key)}
                    </span>
                  </div>
                ))}
              </div>

              <InventoryModal
                data={{
                  action: {
                    button: t("tipItems"),
                    endpoint: `${API}/users/user/${profile.username}/tip`,
                    body: (items) => ({ items }),
                    closeComplete: true
                  },
                  content: (
                    <div className="flex items-center gap-2 min-w-0 p-1.75">
                      <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 mb-1.5">
                        <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                      </div>
                      <span className="text-white text-[14.5px] font-medium truncate">{profile.username}</span>
                    </div>
                  ),
                }}
              >
                <Button
                variant={"default"}
                className="w-full"
              >
                {t("tip")}
              </Button>
              </InventoryModal>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserProfile