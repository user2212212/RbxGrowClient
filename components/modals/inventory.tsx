"use client"
import * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/shadcn/dialog"
import { API } from "@/lib/env"
import { useSiteStore } from "@/store/site"
import { format } from "@/lib/value"
import { X } from "lucide-react"
import { Spinner } from "@/components/shadcn/spinner"
import toast from "react-hot-toast"
import { VirtuosoGrid } from "react-virtuoso"
import { SortIcon, WalletIcon } from "../icons"
import { SearchIcon } from "../icons/Search"
import { Button } from "../shadcn/button"
import { ItemCard } from "../ui/others/item"
import { Item } from "@/types/item"
import Login from "./login"

export enum InventorySecondAction {
  SelectAll = "selectAll",
  AutoSelect = "autoSelect",
  SelectBest = "selectBest",
}

interface InventoryModalData {
  header?: {
    minimumValue?: number
    maximumValue?: number
    maximumItems?: number
  }
  action: {
    button: string
    endpoint: string
    closeComplete?: boolean
    body: (selectedIds: string[]) => Record<string, any>
  } & (
    | { secondaction?: InventorySecondAction.SelectAll | InventorySecondAction.SelectBest; secondactionData?: never }
    | { secondaction: InventorySecondAction.AutoSelect; secondactionData: { min: number; max: number } }
  )
  content?: React.ReactNode
}

interface InventoryModalProps {
  children: React.ReactNode
  data: InventoryModalData
}

const GridList = React.forwardRef(function GridList({ style, children, ...props }: any, ref: React.Ref<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      {...props}
      style={style}
      className="grid grid-cols-2 sm:grid-cols-6 gap-x-2 sm:gap-x-2.5 gap-y-2 sm:gap-y-2.5 w-full min-w-0 px-3 sm:px-6"
    >
      {children}
    </div>
  )
})

const GridItem = ({ children, ...props }: any) => (
  <div {...props} className="w-full min-w-0">
    {children}
  </div>
)

export default function InventoryModal({ children, data }: InventoryModalProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [items, setItems] = React.useState<Item[]>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [totalValue, setTotalValue] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const { token, inventory, user } = useSiteStore()

  const fetchInventory = React.useCallback(() => {
    setLoading(true)
    fetch(`${API}/auth/me/inventory/`, {
      headers: token ? { Authorization: token } : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          toast.error(data.message)
          return
        }
        setItems(data.inventory ?? [])
        setTotalValue(data.total?.totalValue ?? 0)
      })
      .catch(() => toast.error("Something went wrong"))
      .finally(() => setLoading(false))
  }, [token])

  React.useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setSearch("")
    fetchInventory()
  }, [open, fetchInventory])

  React.useEffect(() => {
    if (!open || (actionLoading && data.action.closeComplete)) return
    fetchInventory()
  }, [inventory?.value, fetchInventory, open])

  const toggle = React.useCallback((id: string) => {
    if (!selected.has(id) && data.header?.maximumItems && selected.size >= data.header.maximumItems) {
      toast.error(`You can only select ${data.header.maximumItems} items`)
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [selected, data.header?.maximumItems])

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const aSelected = selected.has(a._id)
      const bSelected = selected.has(b._id)
      if (aSelected !== bSelected) return aSelected ? -1 : 1
      return b.value - a.value || a.item.localeCompare(b.item)
    })
  }, [items, selected])

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? sortedItems.filter((i) => i.item.toLowerCase().includes(query)) : sortedItems
  }, [sortedItems, search])

  const selectedValue = items
    .filter((i) => selected.has(i._id))
    .reduce((sum, i) => sum + (i.value ?? 0), 0)

  const handleAction = () => {
    if (selected.size === 0) return
    setActionLoading(true)

    fetch(data.action.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(data.action.body(Array.from(selected))),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          toast.error(res.message)
          return
        }
        toast.success(res.message)
        if (data.action.closeComplete) return setOpen(false);
        fetchInventory();
      })
      .catch(() => toast.error("Something went wrong")).finally(() => setActionLoading(false))
  }

  if (!user) return <Login>{children}</Login>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[calc(100vw-1rem)] sm:w-245 h-[min(92vh,636px)] sm:h-[min(85vh,636px)] max-w-none! p-0 bg-header-mobile rounded-[10px] flex flex-col gap-0 overflow-hidden"
      >
        <div className="shrink-0 bg-foreground flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-3 px-3 sm:px-6 py-3 sm:py-0 sm:h-24.5">
          <div className="hidden sm:flex items-center gap-2.5 sm:w-auto sm:self-sart sm:mt-6 sm:pr-0">
            <div className="flex items-center gap-2.5 sm:w-45.75 h-8.5 px-3.5 rounded-[10px] bg-wallet">
              <SearchIcon className="text-grey w-4 h-4 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-[15px] leading-4.5 text-grey placeholder:text-grey w-full outline-none select-none"
              />
            </div>
            <div className="flex items-center justify-center w-8.5 h-8.5 aspect-square rounded-[10px] bg-wallet cursor-pointer shrink-0 leading-none">
              <SortIcon className="w-3.25 h-3.25 text-grey shrink-0 block mx-auto" />
            </div>
          </div>

          {!!data.header?.maximumItems && (
            <span className="hidden sm:block absolute mt-16 text-[12px] font-medium text-grey-unfaded whitespace-nowrap">
              Maximum {data.header.maximumItems} items
            </span>
          )}

          <div className="hidden sm:flex items-center gap-3.75 sm:w-auto sm:justify-end sm:self-center sm:pr-0">
            <div className="flex flex-col items-end gap-2.25 min-w-0">
              <div className="flex items-center gap-1.5 text-[14px] leading-3.75 min-w-0">
                {data.header?.minimumValue !== undefined && data.header?.maximumValue !== undefined ? (
                  <>
                    <span className="text-white font-[420] select-none whitespace-nowrap">To Join:</span>
                    <WalletIcon className="w-3.75 h-3.75 shrink-0" />
                    <span className="text-purple-gradient font-[420] truncate">{format(data.header.minimumValue)}</span>
                    <span className="text-white font-[420] select-none">-</span>
                    <WalletIcon className="w-3.75 h-3.75 shrink-0" />
                    <span className="text-purple-gradient font-[420] truncate">{format(data.header.maximumValue)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-[420] select-none whitespace-nowrap">Total Value:</span>
                    <WalletIcon className="w-3.75 h-3.75 shrink-0" />
                    <span className="text-purple-gradient font-[420] truncate">{format(totalValue)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[14px] leading-3.75 min-w-0">
                <span className="text-white font-[420] select-none whitespace-nowrap">Selected Value:</span>
                <WalletIcon className="w-3.75 h-3.75 shrink-0" />
                <span className="text-purple-gradient font-[420] truncate">{format(selectedValue)}</span>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="flex items-center justify-center w-7.75 h-7.75 rounded-[7px] bg-wallet cursor-pointer shrink-0 leading-none"
                aria-label="Close"
              >
                <X className="w-4.25 h-4.25 text-grey" />
              </button>
            </DialogClose>
          </div>

          <div className="flex sm:hidden flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0 h-9 px-3.5 rounded-[10px] bg-wallet">
                <SearchIcon className="text-grey w-4.5 h-4.5 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-[15px] leading-4.5 text-grey placeholder:text-grey w-full min-w-0 outline-none select-none"
                />
              </div>
              <div className="flex items-center justify-center w-9 h-9 aspect-square rounded-[10px] bg-wallet cursor-pointer shrink-0 leading-none">
                <SortIcon className="w-3.5 h-3.5 text-grey shrink-0 block mx-auto" />
              </div>
            </div>

            {!!data.header?.maximumItems && (
              <span className="text-[12px] font-medium text-grey-unfaded whitespace-nowrap">
                Maximum {data.header.maximumItems} items
              </span>
            )}

            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex flex-row items-start gap-x-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[14px] leading-3.75 min-w-0">
                  {data.header?.minimumValue !== undefined && data.header?.maximumValue !== undefined ? (
                    <>
                      <span className="text-white font-[420] select-none whitespace-nowrap">Range:</span>
                      <WalletIcon className="w-4 h-4 shrink-0" />
                      <span className="text-purple-gradient font-[420]">{format(data.header.minimumValue)}</span>
                      <span className="text-white font-[420] select-none">-</span>
                      <WalletIcon className="w-4 h-4 shrink-0" />
                      <span className="text-purple-gradient font-[420]">{format(data.header.maximumValue)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-[420] select-none whitespace-nowrap">Value:</span>
                      <WalletIcon className="w-4 h-4 shrink-0" />
                      <span className="text-purple-gradient font-[420]">{format(totalValue)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[14px] leading-3.75 min-w-0">
                  <span className="text-white font-[420] select-none whitespace-nowrap">Selected:</span>
                  <WalletIcon className="w-4 h-4 shrink-0" />
                  <span className="text-purple-gradient font-[420]">{format(selectedValue)}</span>
                </div>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-wallet cursor-pointer shrink-0 leading-none"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-grey" />
                </button>
              </DialogClose>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 min-w-0 overflow-hidden pt-2.5">
          {loading ? (
            <div className="w-full h-full min-h-87.5 flex items-center justify-center text-purple-secondary text-sm px-4 sm:px-6">
              <Spinner className="size-12" />
            </div>
          ) : filteredItems.length === 0 ? null : (
            <VirtuosoGrid
              style={{ height: "100%" }}
              totalCount={filteredItems.length}
              computeItemKey={(index) => filteredItems[index]._id}
              components={{
                List: GridList,
                Item: GridItem,
              }}
              itemContent={(index) => {
                const item = filteredItems[index]
                return (
                  <ItemCard
                    item={item}
                    isSelected={selected.has(item._id)}
                    onToggle={toggle}
                  />
                )
              }}
            />
          )}
        </div>

        <div className="flex shrink-0 flex-col sm:flex-row justify-center sm:justify-between items-stretch sm:items-center gap-2 sm:gap-2 px-3 sm:px-4.5 sm:h-18 py-2.5 sm:py-0">
          {data.content ?? <div />}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => {
                if (data.action.secondaction === InventorySecondAction.AutoSelect) {
                  let sum = 0
                  const ids: string[] = []
                  for (const i of [...filteredItems].sort((a, b) => b.value - a.value)) {
                    if (sum >= data.action.secondactionData.min) break
                    if (data.header?.maximumItems && ids.length >= data.header.maximumItems) break
                    if (sum + i.value <= data.action.secondactionData.max) {
                      ids.push(i._id)
                      sum += i.value
                    }
                  }
                  setSelected(new Set(ids))
                  return
                }
                if (data.action.secondaction === InventorySecondAction.SelectBest) {
                  setSelected(new Set([...filteredItems].sort((a, b) => b.value - a.value).slice(0, 1).map((i) => i._id)))
                  return
                }
                if (data.header?.maximumItems && filteredItems.length > data.header.maximumItems) {
                  toast.error(`You can only select ${data.header.maximumItems} items`)
                  return
                }
                if (filteredItems.length > 0 && filteredItems.every((i) => selected.has(i._id))) {
                  toast.error("You've already selected all items!")
                  return
                }
                setSelected(new Set(filteredItems.map((i) => i._id)))
              }}
              variant={"foreground"}
              className="w-full sm:w-auto rounded-[10px]">
              <span className="bg-(image:--purple-gradient-secondary) bg-clip-text text-transparent">{data.action.secondaction === InventorySecondAction.AutoSelect ? "Auto select" : data.action.secondaction === InventorySecondAction.SelectBest ? "Select best" : "Select all"}</span>
            </Button>
            <Button onClick={handleAction} loading={actionLoading} className="rounded-xl w-full sm:w-auto items-center">{data.action.button}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}