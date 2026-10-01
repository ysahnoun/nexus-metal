import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Metal — Mobilier métal, abris & charpentes sur mesure",
  description:
    "Nexus Metal en Tunisie : métallerie sur mesure, salons de jardin en acier thermolaqué, fauteuils design, tables, abris, carports et charpentes. Fabrication atelier, pose et devis gratuit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0b1220] text-slate-100 antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
