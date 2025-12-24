import "../app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "OmniSafe AI — See Risk. Not Guess.",
  description:
    "OmniSafe AI helps you detect blockchain and Web3 risks with AI-powered analysis. See threats clearly before they become losses.",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
    apple: "/icons/apple-touch-icon%20180x180.png",
  },
  openGraph: {
    title: "OmniSafe AI — See Risk. Not Guess.",
    description:
      "OmniSafe AI helps you detect blockchain and Web3 risks with AI-powered analysis. See threats clearly before they become losses.",
    images: [
      {
        url: "/icons/og.png",
        width: 1200,
        height: 630,
        alt: "OmniSafe AI — See Risk. Not Guess.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniSafe AI — See Risk. Not Guess.",
    description:
      "OmniSafe AI helps you detect blockchain and Web3 risks with AI-powered analysis. See threats clearly before they become losses.",
    images: ["/icons/og.png"],
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
