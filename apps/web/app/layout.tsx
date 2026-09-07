import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { WalletConnect } from "./wallet-connect";

export const metadata = {
  title: "TollBooth",
  description: "An agent that pays for what it needs, on a budget it can't bypass."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-header-mark">
              TollBooth
            </Link>
            <div className="site-header-right">
              <nav className="site-nav">
                <Link href="/dashboard">Ledger</Link>
              </nav>
              <WalletConnect />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
