import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { rubik } from "@/fonts";
import { cn } from "@/lib/utils";
import { ClientLayout } from "./ClientLayout";
import { TooltipProvider } from "@/components/shadcn/tooltip";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "RbxGrow",
    template: "RbxGrow | %s",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={cn("h-full w-full", rubik.className)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="flex h-full w-full overflow-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>
            <ClientLayout>{children}</ClientLayout>
          </TooltipProvider>
        </NextIntlClientProvider>

        <div className="pointer-events-none fixed inset-0 z-[2147483647] select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -inset-1/2 flex -rotate-[30deg] flex-wrap content-start gap-x-16 gap-y-10">
            {Array.from({ length: 400 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap text-2xl font-bold text-gray-500 opacity-0">
                HAIL SATAN 666
              </span>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}