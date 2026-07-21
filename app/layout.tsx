import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/ui/sidebar";
import Header from "./components/ui/header";
import Chat from "./components/ui/chat";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="flex h-full w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main
              className="flex-1 overflow-y-auto rounded-tl-[35px] border-t border-l border-[#212042] mt-2 ml-2 p-5"
              style={{ background: "rgba(20, 19, 43, 0.4)" }}
            >
              {children}
            </main>
            <Chat />
          </div>
        </div>
      </body>
    </html>
  );
}