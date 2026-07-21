import { rubik } from "@/app/fonts";
import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="bg-sidebar flex h-full w-[285px] shrink-0 flex-col items-center justify-between gap-2.5 px-5 py-8">
      <div className="flex w-[245px] flex-col items-center gap-[15px]">
        <div className="flex h-[68px] w-[245px] items-center justify-center gap-3.5 py-2.5">
          <h1>Placeholder</h1>
        </div>

        <button className="flex w-full items-center gap-2.5 rounded-[10px] bg-[#0F0E25] p-[15px]">
          <Image src="/icons/home.svg" alt="RbxGrow" width={13.33} height={14.58} />
          <span className={`${rubik.className} font-semibold text-xs text-white`}>Home</span>
        </button>

        <div className="flex w-full flex-col items-center gap-[15px] rounded-[10px] bg-[#0F0E25] p-[15px]">
          <div className="flex w-full items-center justify-between">
            <span className="font-[Rubik] text-[13px] font-bold text-[#626B7F]">GAMES</span>
          </div>
          <button key="hi" className="flex w-full items-center gap-2.5">
            <span className="font-[Rubik] text-[13px] font-bold text-[#626B7F]">Hi</span>
          </button>
        </div>
      </div>
    </div>
  );
}