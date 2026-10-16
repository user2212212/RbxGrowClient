"use client"

import { API } from "@/lib/env";
import { UpgraderIcon } from "@/components/icons"
import { Button } from "@/components/shadcn/button";
import InventoryModal from "@/components/modals/inventory";

export default function UpgraderLayout() {
  return (
    <div className="flex flex-col items-center gap-5 sm:gap-7.5 p-3 sm:p-5 w-full">
      <div className="flex flex-row flex-wrap justify-between items-center gap-y-3 gap-x-4 w-full select-none">
        <div className="flex flex-row items-center gap-2.75 ml-1 sm:ml-2">
          <UpgraderIcon className="h-5.5 w-5.5" active={true} />
          <span className="text-[17px] sm:text-[21px] font-medium text-white">
            Upgrader
          </span>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-[12px] sm:text-[13px] font-medium text-white/80">
            ???
          </span>
          <div className="w-px h-8 sm:h-10.25 bg-[#27272A] rounded-full hidden sm:block" />
          <span className="text-[12px] sm:text-[13px] font-medium text-purple-primary/80">
            ???
          </span>
          <InventoryModal
            data={{
              action: {
                button: "Create Giveaway",
                endpoint: `${API}/site/giveaways/create`,
                body: (items) => ({ items }),
                closeComplete: true,
              }
            }}>
            <Button size="default" className="rounded-[15px] p-3 sm:p-3.5 h-10 sm:h-11.25 text-[13px]! sm:text-[14px]!">
              Create Giveaway
            </Button>
          </InventoryModal>
        </div>
      </div>

    </div>
  );
}