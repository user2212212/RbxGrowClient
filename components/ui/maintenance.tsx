"use client";
import Image from "next/image";
import { Button } from "../shadcn/button";
import { SiDiscord, SiX } from "@icons-pack/react-simple-icons";

export default function Maintenance() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4 pb-10">
      <div className="flex flex-col items-center text-center space-y-3 max-w-md md:max-w-2xl w-full">
        <Image
          src="/logos/main.png"
          alt="RbxGrow"
          width={270}
          height={90}
          loading="eager"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-purple-gradient-secondary font-medium md:whitespace-nowrap">
          We are currently under Maintenance
        </h1>
        <h1 className="text-white text-base sm:text-lg md:text-xl font-semibold md:whitespace-nowrap">
          We will be back in no time, and better then ever!
        </h1>
        <div className="flex-1 space-y-2">
          <h1 className="text-white text-medium">want updates? join our socials</h1>
          <div className="flex gap-2 justify-center">
            <a href="https://discord.gg/rbxgrow" target="_blank" rel="noopener noreferrer">
              <Button variant={"foreground"} className="flex items-center justify-center p-0! w-12 h-12">
                <SiDiscord size={25} className="text-icon-secondary" />
              </Button>
            </a>
            <a href="https://x.com/rbxgrow" target="_blank" rel="noopener noreferrer">
              <Button variant={"foreground"} className="flex items-center justify-center p-0! w-12 h-12">
                <SiX size={17} className="text-icon-secondary" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}