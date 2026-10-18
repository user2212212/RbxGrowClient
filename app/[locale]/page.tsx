"use client"

import CoinflipLayout from "@/components/games/coinflip";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Coinflip() {
  const t = useTranslations("Coinflip");

  useEffect(() => {
    document.title = `RbxGrow | ${t("title")}`;
  }, [t]);

  return <CoinflipLayout />
}