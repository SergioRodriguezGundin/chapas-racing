import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Chapas Racing",
  description: "Carreras de chapas — lanza, desliza, gana",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full overflow-hidden font-sans",
        notoSans.variable,
        outfitHeading.variable,
      )}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
