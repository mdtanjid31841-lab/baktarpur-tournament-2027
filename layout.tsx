import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "বক্তারপুর ডেমিনিবার ফুটবল টুর্নামেন্ট ২০২৭",
  description: "বক্তারপুর ডেমিনিবার ফুটবল টুর্নামেন্ট ২০২৭ — দল নিবন্ধন, নিয়মাবলি ও ঘোষণা।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}