import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "chrisocphoto",
  description: "Photo journal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="bg-black text-white h-full w-full overflow-hidden">{children}</body>
    </html>
  );
}
