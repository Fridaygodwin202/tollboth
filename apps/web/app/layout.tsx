import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "TollBooth",
  description: "An agent that pays for what it needs, on a budget it can't bypass."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
