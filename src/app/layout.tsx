import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chapas Racing",
  description: "Carreras de chapas — lanza, desliza, gana",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
