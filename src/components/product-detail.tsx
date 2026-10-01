"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";
import QuoteModal from "@/components/quote-modal";
import type { Product, Review } from "@/db/schema";

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const { addLine, setCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [form, setForm] = useState({ author: "", rating: 5, title: "", comment: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?slug=${product.slug}`).then((r) => r.json()).then((d) => setReviews(d.reviews ?? [])).catch(() => {});
  }, [product.slug]);

  const promo = product.comparePriceCents && product.comparePriceCents > product.priceCents;
  const specLines = product.specs ? product.specs.split("·").map((s) => s.trim()).filter(Boolean) : [];

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setMsg(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews((prev) => [data.review, ...prev]);
      setForm({ author: "", rating: 5, title: "", comment: "" });
      setMsg("Merci ! Votre avis sera publié après vérification. ⚡");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur.");
    } finally { setSending(false); }
  };

  return (
    <div>
      <nav className="mx-auto max-w-7xl px-4 pt-6 text-[13px] text-slate-500 sm:px-6">
        <Link href="/" className="hover:text-sky-400">Accueil</Link> <span className="mx-1">/</span>
        <Link href="/#catalogue" className="hover:text-sky-400">{product.category}</Link> <span className="mx-1">/</span>
        <span className="font-semibold text-slate-200">{product.name}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <div className="card-metal overflow-hidden rounded-[2rem]">
          <img src={product.imageUrl} alt={product.name} className="h-[400px] w-full object-cover sm:h-[540px]" />
          <div className="grid grid-cols-3 gap-2 p-3 text-center text-xs text-slate-400">
            <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">🔩 Soudé en atelier</span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">🎨 Toute teinte RAL</span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">📐 Réalisé sur mesure</span>
          </div>
        </div>

        <div>
          {product.badge && <span className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-3 py-1 text-[11px] font-black uppercase text-white">{product.badge}</span>}
          <h1 className="mt-3 text-4xl font-black leading-tight text-white">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{product.shortDescription}</p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="inline-flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i <= Math.round(product.rating ?? 5) ? "fill-amber-400" : "fill-slate-600"}`}>
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
              ))}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            {product.isQuoteOnly ? (
              <p className="text-4xl font-black blue-text">Sur devis</p>
            ) : (
              <>
                <p className="text-4xl font-black text-white">{formatPrice(product.priceCents)}</p>
                {promo && (
                  <>
                    <p className="pb-1 text-lg text-slate-500 line-through">{formatPrice(product.comparePriceCents!)}</p>
                    <span className="mb-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">
                      −{formatPrice(product.comparePriceCents! - product.priceCents)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {!product.isQuoteOnly && (
            <p className={`mt-2 text-sm font-semibold ${(product.stock ?? 0) <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
              {(product.stock ?? 0) > 0 ? ((product.stock ?? 0) <= 7 ? `⚠️ Plus que ${product.stock} disponibles — fabrication en cours` : "✓ Disponible · délai confirmé par notre atelier") : "Sur commande uniquement"}
            </p>
          )}

          <p className="mt-4 leading-relaxed text-slate-300">{product.description}</p>

          {specLines.length > 0 && (
            <div className="card-metal mt-5 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">Caractéristiques techniques</p>
              <ul className="mt-3 grid gap-1.5 text-sm text-slate-300 sm:grid-cols-2">
                {specLines.map((s) => (
                  <li key={s} className="flex gap-2"><span className="text-sky-400">▸</span>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {product.isQuoteOnly ? (
              <button onClick={() => setQuoteOpen(true)} className="flex-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-sky-300">
                Demander un devis gratuit ⚡
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1.5">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg text-white">−</button>
                  <span className="w-8 text-center font-black text-white">{qty}</span>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg text-white">+</button>
                </div>
                <button
                  onClick={() => { addLine({ slug: product.slug, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl }, qty); setToast(`${qty} × ${product.name} ajouté !`); setTimeout(() => setToast(null), 2500); }}
                  className="flex-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-sky-300 sm:flex-none sm:px-10"
                >
                  Ajouter · {formatPrice(product.priceCents * qty)}
                </button>
                <button onClick={() => setCartOpen(true)} className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Panier</button>
              </>
            )}
          </div>

          {!product.isQuoteOnly && (
            <button onClick={() => setQuoteOpen(true)} className="mt-3 w-full rounded-full border border-sky-400/40 bg-sky-500/10 py-3 text-sm font-bold text-sky-300 hover:bg-sky-500 hover:text-white">
              📐 Je veux ce modèle en dimensions ou teinte personnalisées
            </button>
          )}

          <div className="card-metal mt-6 space-y-2 rounded-2xl p-5 text-sm text-slate-300">
            <p>📦 <strong className="text-white">Sans livraison</strong> — transport ou retrait à organiser séparément</p>
            <p>🔧 <strong className="text-white">Pose possible</strong> — nos monteurs interviennent sur demande</p>
            <p>🏢 <strong className="text-white">Tarifs pro</strong> — dégressifs dès 5 pièces, facturation société</p>
          </div>
        </div>
      </section>

      {/* Avis */}
      <section id="avis-produit" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black text-white">Avis clients ({reviews.length})</h2>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && <p className="card-metal rounded-2xl p-6 text-sm text-slate-400">Aucun avis pour l'instant — soyez le premier à partager votre retour.</p>}
              {reviews.map((r) => (
                <article key={r.id} className="card-metal rounded-2xl p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/15 font-black text-sky-400">{r.author.charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {r.author}
                        {r.verified && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400">VÉRIFIÉ</span>}
                      </p>
                      <p className="text-xs text-slate-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.title}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{r.comment}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Laisser un avis</h2>
            <form onSubmit={submitReview} className="card-metal mt-4 rounded-2xl p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  Votre nom *
                  <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Karim B." className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400" />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  Note *
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-white/15 bg-[#111a2b] px-3 py-2 text-sm text-white">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium text-slate-300">
                Titre *
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Finition irréprochable" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400" />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-300">
                Votre avis *
                <textarea required rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Qualité des soudures, tenue dans le temps, pose…" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400" />
              </label>
              {msg && <p className="mt-3 rounded-xl bg-sky-500/15 px-4 py-2 text-sm text-sky-300">{msg}</p>}
              <button disabled={sending} className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-extrabold text-white disabled:opacity-60">
                {sending ? "Envoi…" : "Publier mon avis"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-black text-white">Dans le même esprit</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/produit/${p.slug}`} className="card-metal group overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-sky-400/40">
                <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-48 w-full object-cover transition group-hover:scale-105" />
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400">{p.category}</p>
                  <p className="font-extrabold text-white">{p.name}</p>
                  <p className="mt-1 font-black text-sky-400">{p.isQuoteOnly ? "Sur devis" : formatPrice(p.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} presetType={product.name} />

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-sky-400/40 bg-[#111a2b] px-5 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>}
    </div>
  );
}
