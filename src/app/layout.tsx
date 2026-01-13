import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jumbl - Word Game Challenge",
  description: "A fun word game where you find words from a jumbled set of letters!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
