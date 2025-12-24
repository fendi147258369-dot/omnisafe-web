import "../app/globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "OmniSafe AI",
  description: "Token risk facts and liquidity intelligence",
  icons: {
    icon: "/icons/tubiao.png",
    shortcut: "/icons/tubiao.png",
    apple: "/icons/tubiao.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
