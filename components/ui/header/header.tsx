"use client";

import { cn } from "@/lib/utils";
import { Button } from "../../shadcn/button";
import { Login } from "../../modals/login";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSiteStore } from "@/store/site";
import { DropdownIcon, DropdownSecondaryIcon, InventoryIcon, WalletIcon } from "@/components/icons";
import { format } from "@/lib/value";
import { getRank, getRankColor } from "@/lib/ranks";
import { API } from "@/lib/env";
import NotificationPopover from "./notification";
import InventoryModal from "../../modals/inventory";

export default function Header({ className }: { className?: string }) {
  const { user, inventory, site } = useSiteStore();
  const router = useRouter();

  return (
    <div className={cn("md:bg-header bg-header-mobile w-full h-20 shrink-0 flex items-center md:px-8 px-5 relative select-none", className)}>
      {!user ? (
        <Login>
          <Button className="text-1xl ml-auto">
            LOGIN WITH <Image src="/icons/roblox.webp" width={25} height={25} alt="rbx" />
          </Button>
        </Login>
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0 sm:contents">
            <Image src="/logos/main.png" alt="RbxGrow" width={100} height={14} loading="eager" className="md:hidden shrink-0" />
            <div className="flex items-center w-fit min-w-0 h-10.5 bg-wallet rounded-[10px] sm:fixed sm:left-1/2 sm:top-5 sm:-translate-x-1/2 sm:z-50 sm:w-45">
              <div className="flex items-center gap-2 px-3 h-full flex-1 min-w-0">
                <WalletIcon className="w-5 h-4 shrink-0" />
                <span className="text-[14px] font-semibold bg-[linear-gradient(113.96deg,#AE62FF_0%,#DAB8FF_50%,#AE62FF_100%)] bg-clip-text text-transparent truncate">
                  {format(inventory?.value || 0.00)}
                </span>
                <DropdownSecondaryIcon className="w-3.5 h-3.5 text-grey-secondary m-[1.5px] shrink-0 ml-auto" />
              </div>
              <InventoryModal
                data={{
                  action: {
                    button: "Withdraw items",
                    endpoint: `${API}/auth/me/withdraw`,
                    body: (items) => ({ items }),
                    closeComplete: false
                  }
                }}>
                <Button size={"icon-sm"} className="flex items-center justify-center w-10.5 h-full p-2.5 gap-1 rounded-[10px] shrink-0">
                  <InventoryIcon className="w-5.5 h-5.5 text-dark-purple" />
                </Button>
              </InventoryModal>
            </div>
          </div>

          <div className="ml-auto flex gap-4.5 items-center shrink-0 pl-2">
            <NotificationPopover />
            <div className="hidden md:flex md:gap-2 gap-0.5 items-center text-center cursor-pointer" onClick={() => router.push("/me")}>
              <Image src={user.avatar} width={35} height={35} alt="user" className="rounded-full mb-1.5" />
              <span className="items-center gap-1.5n">
                {getRank(site?.ranks, user.ranks)?.icon && (
                  <Image src={getRank(site?.ranks, user.ranks)!.icon!} alt="" width={15} height={15} />
                )}
                <h1
                  className="text-white font-bold text-[15px]"
                  style={getRankColor(getRank(site?.ranks, user.ranks)?.color)}
                >
                  @{user.username}
                </h1>
              </span>
              <DropdownIcon className="h-2.5 w-2.5 text-grey transition-transform duration-200 ml-1 rotate-180" />
            </div>
          </div>
        </>
      )
      }
    </div >
  );
}