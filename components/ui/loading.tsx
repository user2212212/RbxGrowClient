"use client";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col gap-10 justify-center items-center">
      <style>{`@keyframes loading-bar { from { width: 0%; } to { width: 100%; } }`}</style>
      <Image src="/logos/main.png" alt="RbxGrow" width={300} height={60} loading="eager" />
      <div className="h-2 w-60 overflow-hidden rounded-full bg-foreground">
        <div
          className="h-full rounded-full"
          style={{ background: "var(--purple-gradient)", animation: "loading-bar 2s linear forwards" }}
        />
      </div>
    </div>
  );
}