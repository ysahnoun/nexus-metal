import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/lib/ensure-seed";
import { eq, ne } from "drizzle-orm";
import ProductDetailClient from "@/components/product-detail";
import { NexusLogo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSeed();
  const found = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!found[0]) notFound();
  const product = found[0];
  const related = await db.select().from(products).where(ne(products.id, product.id)).limit(4);

  return (
    <div className="min-h-screen bg-[#0b1220]">
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 px-4 py-2 text-center text-[13px] font-semibold text-white">
        ⚡ Devis gratuit sous 24 h
      </div>
      <header className="border-b border-white/10 bg-[#0b1220]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/"><NexusLogo size={44} /></Link>
          <Link href="/#catalogue" className="ml-auto rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            ← Catalogue
          </Link>
        </div>
      </header>
      <ProductDetailClient product={product} related={related} />
      <footer className="border-t border-white/10 bg-[#080e1a] py-6 text-center text-xs text-slate-500">
        © 2026 Nexus Metal — <Link href="/" className="underline hover:text-sky-400">Catalogue</Link> · <Link href="/admin" className="underline hover:text-sky-400">Espace pro</Link>
      </footer>
    </div>
  );
}
