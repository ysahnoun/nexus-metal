"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";
import { CATEGORIES } from "@/lib/seed-data";
import { NexusLogo } from "@/components/logo";
import QuoteModal from "@/components/quote-modal";
import type { Product } from "@/db/schema";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${i <= Math.round(value) ? "fill-amber-400" : "fill-slate-600"}`}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export default function ShopHome({ initialProducts }: { initialProducts: Product[] }) {
  const { lines, count, subtotalCents, isCartOpen, setCartOpen, addLine, updateQty, removeLine, clear } = useCart();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Tout");
  const [sort, setSort] = useState("populaire");
  const [toast, setToast] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteType, setQuoteType] = useState<string | undefined>(undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", notes: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openQuote = (type?: string) => {
    setQuoteType(type);
    setQuoteOpen(true);
  };

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (cat !== "Tout") list = list.filter((p) => p.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.shortDescription} ${p.category}`.toLowerCase().includes(q));
    }
    switch (sort) {
      case "prix-croissant": list.sort((a, b) => a.priceCents - b.priceCents); break;
      case "prix-decroissant": list.sort((a, b) => b.priceCents - a.priceCents); break;
      case "note": list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default: list.sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
    }
    return list;
  }, [initialProducts, cat, query, sort]);

  const hero = initialProducts.find((p) => p.slug === "salon-atlas-anthracite") ?? initialProducts[0];
  const total = subtotalCents;

  const submitOrder = async () => {
    setFormError(null);
    if (lines.length === 0) { setFormError("Votre panier est vide."); return; }
    if (!form.customerName.trim() || !form.email.trim()) {
      setFormError("Merci de remplir votre nom et votre adresse e-mail."); return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cart: lines.map((l) => ({ slug: l.slug, qty: l.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Commande impossible.");
      clear(); setCheckoutOpen(false); setCartOpen(false);
      window.location.href = `/commande/${data.order.id}`;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally { setPlacing(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Bandeau */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 px-4 py-2 text-center text-[13px] font-semibold text-white">
        ⚡ Devis gratuit sous 24 h
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/"><NexusLogo size={44} /></Link>
          <nav className="ml-8 hidden items-center gap-6 text-sm font-semibold text-slate-300 lg:flex">
            <a href="#catalogue" className="hover:text-sky-400">Catalogue</a>
            <a href="#structures" className="hover:text-sky-400">Abris & Charpentes</a>
            <a href="#atelier" className="hover:text-sky-400">L'atelier</a>
            <a href="#faq" className="hover:text-sky-400">FAQ</a>
            
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 md:flex">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-slate-400 stroke-2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className="w-36 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
            </div>
            <button onClick={() => openQuote()} className="hidden rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:from-sky-300 sm:inline-flex">
              Devis gratuit
            </button>
            <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6L5 3H2" /><circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /></svg>
              <span className="hidden sm:inline">Panier</span>
              {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-sky-500 px-1 text-xs font-black">{count}</span>}
            </button>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-2 md:hidden">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit…" className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.28),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-sky-300">
              <span className="animate-spark h-1.5 w-1.5 rounded-full bg-amber-400" /> Fabrication métallique
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="steel-text">L'acier qui</span>{" "}
              <span className="blue-text">change tout</span>
              <span className="steel-text"> chez vous.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Nexus Metal conçoit, fabrique et pose votre mobilier métal design, vos abris et vos charpentes.
              Tout est soudé dans notre atelier, thermolaqué dans la teinte RAL de votre choix, et dimensionné à vos cotes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#catalogue" className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/40 hover:from-sky-300">
                Voir le catalogue
              </a>
              <button onClick={() => openQuote()} className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-extrabold text-white hover:bg-white/10">
                Devis sur mesure gratuit
              </button>
            </div>
            <p className="mt-9 inline-flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-slate-300">
              <span className="text-2xl font-black text-white">24 h</span>
              <span>pour recevoir une première réponse à votre demande de devis</span>
            </p>
          </div>

          <div className="relative">
            {hero && (
              <div className="card-metal overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="relative">
                  <img src={hero.imageUrl} alt={hero.name} className="h-[400px] w-full object-cover sm:h-[480px]" />
                  <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-sky-300 backdrop-blur">
                    {hero.badge ?? "Pièce vedette"}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/70 p-4 backdrop-blur">
                    <div className="min-w-0">
                      <p className="truncate text-base font-extrabold text-white">{hero.name}</p>
                      <p className="mt-0.5 text-sm font-bold text-sky-400">{formatPrice(hero.priceCents)} <span className="ml-1"><Stars value={hero.rating ?? 5} /></span></p>
                    </div>
                    <button
                      onClick={() => { addLine({ slug: hero.slug, name: hero.name, priceCents: hero.priceCents, imageUrl: hero.imageUrl }); showToast(`${hero.name} ajouté`); }}
                      className="shrink-0 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-400"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="animate-float-soft absolute -left-3 -top-4 hidden rounded-2xl border border-white/15 bg-[#111a2b] px-4 py-3 shadow-xl sm:block">
              <p className="text-xs text-slate-400">Thermolaquage</p>
              <p className="text-sm font-bold text-white">200+ teintes RAL ✨</p>
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance */}
      <section className="border-b border-white/10 bg-[#0e1626]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-7 sm:px-6 lg:grid-cols-4">
          {[
            ["🔩", "Fabrication atelier", "Soudé, meulé, contrôlé chez nous"],
            ["🎨", "Toute teinte RAL", "Thermolaquage four, sans supplément"],
            ["📐", "100 % sur mesure", "Vos cotes, vos contraintes, vos finitions"],
            ["✨", "Finitions soignées", "Assemblages contrôlés et traitement anticorrosion"],
          ].map(([icon, t, d]) => (
            <div key={t} className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl">{icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{t}</p>
                <p className="text-xs text-slate-400">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Catalogue</p>
            <h2 className="mt-1 text-3xl font-black text-white sm:text-4xl">Mobilier métal & structures</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Toutes nos références existent aussi en dimensions et teintes personnalisées. Contactez l'atelier pour confirmer la disponibilité et le délai.</p>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-white/15 bg-[#111a2b] px-4 py-2.5 text-sm font-semibold text-white">
            <option value="populaire">Trier : populaires</option>
            <option value="note">Trier : mieux notés</option>
            <option value="prix-croissant">Trier : prix croissant</option>
            <option value="prix-decroissant">Trier : prix décroissant</option>
          </select>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${cat === c ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white" : "border border-white/15 bg-white/5 text-slate-300 hover:border-sky-400/60"}`}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card-metal mt-10 rounded-3xl p-12 text-center">
            <p className="text-xl font-bold text-white">Aucune pièce trouvée</p>
            <p className="mt-1 text-sm text-slate-400">On fabrique aussi sur mesure — décrivez votre besoin.</p>
            <button onClick={() => openQuote()} className="mt-4 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white">Demander un devis</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const promo = p.comparePriceCents && p.comparePriceCents > p.priceCents;
              const pct = promo ? Math.round((1 - p.priceCents / p.comparePriceCents!) * 100) : 0;
              return (
                <article key={p.id} className="card-metal group flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-2xl hover:shadow-blue-950/50">
                  <Link href={`/produit/${p.slug}`} className="relative block overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                    {p.badge && <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-3 py-1 text-[11px] font-black uppercase text-white">{p.badge}</span>}
                    {promo && <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white">−{pct} %</span>}
                    {!p.isQuoteOnly && (p.stock ?? 0) <= 7 && <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-amber-300">Plus que {p.stock} en stock</span>}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-400">{p.category}</p>
                    <Link href={`/produit/${p.slug}`} className="mt-1 block text-lg font-extrabold leading-snug text-white hover:text-sky-300">{p.name}</Link>
                    <p className="mt-1 line-clamp-2 text-[13px] text-slate-400">{p.shortDescription}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars value={p.rating ?? 5} />
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                      <div>
                        {p.isQuoteOnly ? (
                          <p className="text-lg font-black blue-text">Sur devis</p>
                        ) : (
                          <>
                            <p className="text-xl font-black text-white">{formatPrice(p.priceCents)}</p>
                            {promo && <p className="text-xs text-slate-500 line-through">{formatPrice(p.comparePriceCents!)}</p>}
                          </>
                        )}
                      </div>
                      {p.isQuoteOnly ? (
                        <button onClick={() => openQuote(p.name)} className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 text-[13px] font-bold text-white hover:from-sky-300">Devis</button>
                      ) : (
                        <button
                          onClick={() => { addLine({ slug: p.slug, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl }); showToast(`${p.name} ajouté au panier`); }}
                          className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-sky-500"
                        >
                          + Panier
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Structures / services */}
      <section id="structures" className="border-y border-white/10 bg-[#0e1626]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Nos métiers</p>
          <h2 className="mt-1 text-3xl font-black text-white sm:text-4xl">Charpentes, abris et pièces sur mesure</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Du fauteuil unitaire au hangar de 600 m², notre bureau d'études et notre atelier gèrent toute la chaîne : conception, calcul, fabrication, galvanisation, pose.</p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { img: "/images/charpente-metallique.jpg", t: "Charpentes métalliques", d: "Hangars, bâtiments d'activité, mezzanines, passerelles. Notes de calcul Eurocode et plans d'exécution fournis.", type: "Charpente métallique / hangar" },
              { img: "/images/abri-carport.jpg", t: "Abris & carports", d: "Carports 1 à 4 véhicules, préaux, auvents. Couverture polycarbonate, bac acier ou tuile. Garantie décennale.", type: "Abri, carport ou préau" },
              { img: "/images/canape-horizon.jpg", t: "Mobilier & pièces sur mesure", d: "Salons, tables, garde-corps, escaliers, verrières. Vos cotes exactes, votre teinte RAL, vos finitions.", type: "Autre pièce métallique" },
            ].map((s) => (
              <article key={s.t} className="card-metal overflow-hidden rounded-3xl">
                <img src={s.img} alt={s.t} loading="lazy" className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-xl font-extrabold text-white">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
                  <button onClick={() => openQuote(s.type)} className="mt-4 w-full rounded-full border border-sky-400/40 bg-sky-500/10 py-2.5 text-sm font-bold text-sky-300 hover:bg-sky-500 hover:text-white">
                    Demander un devis →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Atelier / process */}
      <section id="atelier" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Notre méthode</p>
        <h2 className="mt-1 text-3xl font-black text-white sm:text-4xl">De l'idée à la pose, en 4 étapes</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[
            ["01", "Échange & relevé", "Vous décrivez le projet, on relève les cotes sur site ou sur plan. Conseil gratuit sur les sections et teintes."],
            ["02", "Devis & plan 3D", "Chiffrage détaillé sous 24 h avec vue 3D. Aucun acompte demandé à cette étape."],
            ["03", "Fabrication atelier", "Débit, soudure, meulage, traitement anticorrosion et thermolaquage dans votre teinte RAL."],
            ["04", "Retrait & installation", "Le retrait ou le transport est organisé séparément selon votre projet."],
          ].map(([n, t, d]) => (
            <div key={n} className="card-metal rounded-3xl p-6">
              <p className="text-4xl font-black blue-text">{n}</p>
              <p className="mt-2 text-base font-extrabold text-white">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-black text-white">Questions fréquentes</h2>
        <div className="mt-6 space-y-3">
          {[
            ["Quels sont vos délais de fabrication ?", "Le délai dépend du modèle, des dimensions et de la finition choisie. Notre atelier confirme un calendrier précis après validation de votre demande ou de votre commande."],
            ["Le thermolaquage résiste-t-il vraiment dehors ?", "Oui. Nous dégraissons, sablons puis appliquons une poudre polyester qualité façade cuite à 200 °C. Pour le bord de mer ou la piscine, nous proposons une galvanisation à chaud avant laquage, garantie 10 ans contre la corrosion perforante."],
            ["Puis-je choisir ma couleur et mes dimensions ?", "Absolument : plus de 200 teintes RAL disponibles sans supplément, et toutes nos références peuvent être refaites à vos cotes exactes. Envoyez vos mesures dans le formulaire de devis, on vous renvoie un plan coté."],
            ["Proposez-vous la pose ?", "La pose peut être étudiée pour les abris, charpentes, garde-corps et escaliers. Les prix affichés sont sans livraison ; le transport et l'installation font l'objet d'un accord séparé."],
            ["Travaillez-vous avec les professionnels ?", "Oui : architectes, promoteurs, hôtels, restaurants et collectivités. Tarifs dégressifs dès 5 pièces, facturation avec compte client, et interlocuteur unique au bureau d'études. Contactez-nous via le formulaire en précisant votre société."],
          ].map(([q, a], i) => (
            <div key={q} className="card-metal overflow-hidden rounded-2xl">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-white">
                {q}
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-sky-400 transition ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && <p className="animate-fade-up border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-400">{a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA devis */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-sky-500/25 bg-gradient-to-br from-blue-900/60 via-[#0e1626] to-[#0b1220] px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_55%)]" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Parlons de votre projet</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-black text-white sm:text-4xl">Un besoin en métal ? On le fabrique.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">Étude, plan 3D et chiffrage offerts. Réponse d'un technicien sous 24 h ouvrées, sans aucun engagement.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => openQuote()} className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-blue-900/50 hover:from-sky-300">
                Demander mon devis gratuit ⚡
              </button>
              <a href="mailto:nexusmetal26@gmail.com" className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-extrabold text-white hover:bg-white/10">
                ✉ Écrire à l'atelier
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080e1a]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <NexusLogo size={46} />
            <p className="mt-3 text-sm text-slate-400">Métallerie, charpente et mobilier design fabriqués sur mesure dans notre atelier en Tunisie.</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Catalogue</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
              <li><a href="#catalogue" className="hover:text-sky-400">Salons de jardin</a></li>
              <li><a href="#catalogue" className="hover:text-sky-400">Fauteuils & tables</a></li>
              <li><a href="#catalogue" className="hover:text-sky-400">Décoration métal</a></li>
              <li><a href="#structures" className="hover:text-sky-400">Abris & charpentes</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Nexus Metal</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
              <li><a href="#atelier" className="hover:text-sky-400">Notre méthode</a></li>
              <li><a href="#structures" className="hover:text-sky-400">Nos réalisations</a></li>
              <li><a href="#faq" className="hover:text-sky-400">FAQ</a></li>
              
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Suivre une commande</p>
            <TrackForm />
            <p className="mt-4 text-sm text-slate-400"><a href="mailto:nexusmetal26@gmail.com" className="hover:text-sky-400">nexusmetal26@gmail.com</a><br />Zone industrielle, Tunisie</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">© 2026 Nexus Metal — Charpentes · Abris · Mobilier et pièces sur mesure</div>
      </footer>

      {/* Bouton devis flottant mobile */}
      <button onClick={() => openQuote()} className="fixed bottom-5 right-5 z-40 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-2xl shadow-blue-900/60 sm:hidden">
        ⚡ Devis
      </button>

      {/* Drawer panier */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0e1626] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-xl font-extrabold text-white">Panier ({count})</p>
              <button onClick={() => setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg text-white">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <p className="text-5xl">🔩</p>
                    <p className="mt-3 text-xl font-bold text-white">Votre panier est vide</p>
                    <p className="mt-1 text-sm text-slate-400">Parcourez le catalogue ou demandez une pièce sur mesure.</p>
                    <button onClick={() => setCartOpen(false)} className="mt-4 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-white">Voir le catalogue</button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li key={l.slug} className="card-metal flex gap-3 rounded-2xl p-3">
                      <img src={l.imageUrl} alt={l.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{l.name}</p>
                        <p className="text-sm font-black text-sky-400">{formatPrice(l.priceCents)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => updateQty(l.slug, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-white">−</button>
                          <span className="w-6 text-center text-sm font-bold text-white">{l.qty}</span>
                          <button onClick={() => updateQty(l.slug, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-white">+</button>
                          <button onClick={() => removeLine(l.slug)} className="ml-auto text-xs text-slate-500 underline hover:text-red-400">retirer</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 && (
              <div className="border-t border-white/10 px-5 py-4">
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between text-slate-300"><span>Sous-total</span><span className="font-bold text-white">{formatPrice(subtotalCents)}</span></p>
                  <p className="flex justify-between text-slate-300"><span>Transport</span><span className="font-bold text-white">Sans livraison</span></p>
                  <p className="flex justify-between border-t border-white/10 pt-2 text-base font-black text-white"><span>Total sans livraison</span><span>{formatPrice(total)}</span></p>
                </div>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-extrabold text-white hover:from-sky-300">
                  Commander · {formatPrice(total)}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Checkout */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCheckoutOpen(false)} />
          <div className="card-metal relative mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl rounded-3xl p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Étape finale</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">Votre commande</h3>
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg text-white">×</button>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {lines.map((l) => (
                <p key={l.slug} className="flex justify-between py-0.5"><span>{l.qty} × {l.name}</span><span className="font-bold text-white">{formatPrice(l.priceCents * l.qty)}</span></p>
              ))}
              <p className="mt-2 flex justify-between border-t border-white/10 pt-2 font-black text-white"><span>Total sans livraison</span><span>{formatPrice(total)}</span></p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {([
                ["customerName", "Nom complet *", "Yassine Benali"],
                ["email", "E-mail *", "contact@email.fr"],
                ["phone", "Téléphone", "06 12 34 56 78"],
              ] as const).map(([key, label, ph]) => (
                <label key={key} className="block text-sm font-medium text-slate-300">
                  {label}
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
                </label>
              ))}

              <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                Précisions (teinte RAL, étage, accès camion…)
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400" />
              </label>
            </div>
            {formError && <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-300">{formError}</p>}
            <button onClick={submitOrder} disabled={placing} className="mt-5 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-extrabold text-white hover:from-sky-300 disabled:opacity-60">
              {placing ? "Enregistrement…" : `Valider ma commande · ${formatPrice(total)} 🔒`}
            </button>
          </div>
        </div>
      )}

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} presetType={quoteType} />

      {toast && (
        <div className="animate-fade-up fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-sky-400/40 bg-[#111a2b] px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function TrackForm() {
  const [val, setVal] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (val.trim()) window.location.href = `/commande/${val.trim()}`; }} className="mt-2 flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="N° de commande…" className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
      <button className="shrink-0 rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white">OK</button>
    </form>
  );
}
