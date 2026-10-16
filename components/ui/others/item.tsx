import * as React from "react"
import Image from "next/image";
import { format } from "@/lib/value";
import { WalletIcon } from "@/components/icons";
import { Item } from "@/types/item";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";

interface ItemCardProps {
  item: Item
  isSelected?: boolean
  onToggle?: (id: string) => void
}

export const ItemCard = React.memo(
  function ItemCard({ item, isSelected = false, onToggle }: ItemCardProps) {
    const rarities = useSiteStore((s) => s.site!.rarities)
    const rarityColor = rarities.find((r) => r._id.toLowerCase() === item.rarity?.toLowerCase())?.color
    const isRainbow = item.variants.mutation === "RAINBOW" || item.rarity?.toLowerCase() === "super"
    const bottomBorder = isRainbow
      ? "linear-gradient(81.59deg, #FF0000 0%, #FFFF00 17%, #00FF00 34%, #00FFFF 51%, #0000FF 68%, #FF00FF 85%, #FF0000 100%)"
      : rarityColor
    return (
      <button
        type="button"
        onClick={onToggle ? () => onToggle(item._id) : undefined}
        className={cn(
          "block w-full",
          onToggle
            ? "cursor-pointer hover:opacity-80 transition-opacity duration-200"
            : "cursor-default"
        )}
      >
        <div className="relative w-full aspect-140/184 rounded-[10px] overflow-hidden box-border">
          <div
            style={{
              background: bottomBorder,
              height: "14px",
            }}
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
          />
          <div
            style={{
              background: `linear-gradient(180deg, ${isSelected ? "#9837FF" : "#28263D"} 0%, rgba(11, 10, 28, 0.5) 100%), #0B0A1C`,
              borderRadius: "10px",
              bottom: "2.8px",
            }}
            className="absolute top-0 left-0 right-0 pt-0.5 px-0.5 box-border overflow-hidden"
          >
            <div className="relative flex flex-col items-center w-full h-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 overflow-hidden bg-[#0B0A1C] rounded-t-lg">
              <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
                <div className="relative w-20 h-20 sm:w-22 sm:h-21 shrink-0">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-contain blur-[5px] opacity-70 absolute"
                  />
                  <Image src={item.image} alt={item.item} fill className="object-contain relative" />
                </div>
              </div>
              <div className="flex flex-col items-start gap-0.5 w-full mt-auto">
                <span
                  className="text-white font-bold text-[13px] sm:text-[12px] leading-4 sm:leading-3.75 w-full text-left select-none"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.item}
                </span>
                <div className="flex items-center gap-1">
                  <WalletIcon className="w-3.5 h-3.5 sm:w-3.25 sm:h-3.25 shrink-0" />
                  <span className="text-purple-gradient text-[13px] sm:text-[12px] font-medium select-none truncate">{format(item.value)}</span>
                </div>
              </div>
            </div>
          </div>
            <span
              className={cn(
                "absolute top-3.25 right-3.25 z-10 w-2.75 h-2.75 rounded-full shrink-0 outline-[1.5px] outline-[#232136]",
                isSelected ? "bg-(image:--purple-gradient-bottom)" : "bg-transparent", !onToggle ? "opacity-0" : "",
              )}
            />
          <div
            style={{
              background: item.rarity?.toLowerCase() === "super"
                ? "linear-gradient(209.21deg, rgba(11, 10, 28, 0.2) 30.96%, rgba(203, 48, 224, 0.2) 64.97%, rgba(97, 85, 245, 0.2) 69.97%, rgba(0, 136, 255, 0.2) 74.98%, rgba(52, 199, 89, 0.2) 79.98%, rgba(255, 204, 0, 0.2) 84.99%, rgba(255, 141, 40, 0.2) 89.99%, rgba(255, 56, 60, 0.2) 95%)"
                : `linear-gradient(209.21deg, rgba(11, 10, 28, 0.1) 32.94%, ${rarityColor}4D 100%)`,
            }}
            className="absolute inset-0 pointer-events-none rounded-[10px] mix-blend-screen"
          />
        </div>
      </button>
    )
  },
  (prev, next) => prev.item === next.item && prev.isSelected === next.isSelected && prev.onToggle === next.onToggle
)