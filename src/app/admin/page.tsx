import { db } from "@/db";
import { orders, products, quotes, reviews } from "@/db/schema";
import { ensureSeed } from "@/lib/ensure-seed";
import { desc } from "drizzle-orm";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { NexusLogo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await ensureSeed();
  const [allOrders, allProducts, allQuotes, allReviews] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(25),
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(25),
    db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(6),
  ]);
  const revenue = allOrders.reduce((s, o) => s + o.totalCents, 0);
  const lowStock = allProducts.filter((p) => !p.isQuoteOnly && (p.stock ?? 0) <= 7);

  return (
    <div className="min-h-screen bg-[#0b1220]">
      <header className="border-b border-white/10 bg-[#080e1a] px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3 sm:px-6">
          <Link href="/"><NexusLogo size={42} /></Link>
          <Link href="/" className="ml-auto rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">← Voir le site</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black text-white">Espace pro — pilotage de l'atelier</h1>
        <p className="mt-1 text-sm text-slate-400">Commandes, demandes de devis et stocks en direct depuis PostgreSQL.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["💰 Chiffre d'affaires", formatPrice(revenue), `${allOrders.length} commandes`],
            ["📋 Demandes de devis", String(allQuotes.length), `${allQuotes.filter((q) => q.status === "nouveau").length} à traiter`],
            ["🔩 Références en ligne", String(allProducts.length), `${lowStock.length} en stock bas`],
            ["✉️ Contact atelier", "E-mail", "nexusmetal26@gmail.com"],
          ].map(([t, n, d]) => (
            <div key={t} className="card-metal rounded-3xl p-5">
              <p className="text-sm text-slate-400">{t}</p>
              <p className="mt-1 text-3xl font-black text-white">{n}</p>
              <p className="text-xs text-sky-400">{d}</p>
            </div>
          ))}
        </div>

        {/* Devis */}
        <div className="card-metal mt-8 rounded-3xl p-6">
          <h2 className="text-xl font-extrabold text-white">Demandes de devis</h2>
          {allQuotes.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              Aucune demande pour l'instant. Testez le bouton « Devis gratuit » sur le site — la demande apparaîtra ici immédiatement.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2">Réf.</th><th>Client</th><th>Projet</th><th>Dimensions</th><th>Budget</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {allQuotes.map((q) => (
                    <tr key={q.id} className="border-b border-white/5">
                      <td className="py-2.5 font-bold text-sky-400">{q.reference}</td>
                      <td>
                        <span className="block font-semibold text-white">{q.fullName}</span>
                        <span className="text-xs text-slate-500">{q.company ? `${q.company} · ` : ""}{q.email}</span>
                      </td>
                      <td className="text-slate-300">{q.projectType}</td>
                      <td className="text-slate-400">{q.dimensions || "—"}</td>
                      <td className="text-slate-400">{q.budget || "—"}</td>
                      <td><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold capitalize text-amber-400">{q.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card-metal rounded-3xl p-6 lg:col-span-2">
            <h2 className="text-xl font-extrabold text-white">Commandes catalogue</h2>
            {allOrders.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                Aucune commande. Ajoutez un produit au panier et validez : elle apparaîtra ici avec décrément automatique du stock.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2">N°</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((o) => (
                      <tr key={o.id} className="border-b border-white/5">
                        <td className="py-2.5 font-bold text-white">{o.orderNumber}</td>
                        <td><span className="block font-medium text-slate-200">{o.customerName}</span><span className="text-xs text-slate-500">{o.city}</span></td>
                        <td className="font-black text-white">{formatPrice(o.totalCents)}</td>
                        <td><span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-400">{o.status}</span></td>
                        <td className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString("fr-TN", { day: "numeric", month: "short" })}</td>
                        <td><Link href={`/commande/${o.id}`} className="text-xs font-bold text-sky-400 underline">suivi →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {allReviews.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Derniers avis</p>
                <ul className="mt-2 space-y-2">
                  {allReviews.map((r) => (
                    <li key={r.id} className="text-sm text-slate-400">
                      <span className="font-bold text-white">{r.author}</span> · {"★".repeat(r.rating)} · {r.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-metal rounded-3xl p-6">
              <h2 className="text-xl font-extrabold text-white">Stocks atelier</h2>
              <ul className="mt-3 space-y-2.5">
                {allProducts.filter((p) => !p.isQuoteOnly).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 text-sm">
                    <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-200">{p.name}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${(p.stock ?? 0) <= 7 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, ((p.stock ?? 0) / 50) * 100)}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-black ${(p.stock ?? 0) <= 7 ? "text-amber-400" : "text-slate-400"}`}>{p.stock}</span>
                  </li>
                ))}
              </ul>
              {lowStock.length > 0 && (
                <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
                  ⚠️ À relancer en production : {lowStock.map((p) => p.name).join(", ")}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-sky-500/25 bg-gradient-to-br from-blue-900/50 to-[#0b1220] p-6">
              <h2 className="text-xl font-extrabold text-white">Produits sur devis</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {allProducts.filter((p) => p.isQuoteOnly).map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="text-sky-400">▸</span>{p.name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">Ces références n'ont pas de prix public : chaque demande passe par le formulaire de devis et atterrit dans le tableau ci-dessus.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
