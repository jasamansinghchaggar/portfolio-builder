import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forme — Your work, beautifully presented",
  description: "Build a portfolio that feels like you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
