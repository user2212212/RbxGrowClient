"use client"

import CoinflipLayout from "@/components/games/coinflip";
import { useEffect } from "react";

export default function Coinflip() {
  useEffect(() => {
    document.title = "RbxGrow | Coinflip"
  }, [])

  return <CoinflipLayout />
}