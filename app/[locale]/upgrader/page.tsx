"use client"

import UpgraderLayout from "@/components/games/upgrader";
import { useEffect } from "react";

export default function Upgrader(){
  useEffect(() => {
    document.title = "RbxGrow | Upgrader"
  }, [])

  return <UpgraderLayout />
}