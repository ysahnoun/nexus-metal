import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { formatPrice } from "@/lib/format";
import { NexusLogo } from "@/components/logo";

export const dynamic = "force-dynamic";

const STEPS = ["confirmée", "en fabrication", "prête", "retirée"];

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await db.select().from(orders).where(or(eq(orders.id, id), eq(orders.orderNumber, id))).limit(1);
  if (!found[0]) notFound();
  const order = found[0];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const stepIndex = Math.max(0, STEPS.indexOf(order.status));

  return (
    <div className="min-h-screen bg-[#0b1220]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-4 sm:px-6">
          <Link href="/"><NexusLogo size={42} /></Link>
          <Link href="/" className="ml-auto text-sm font-bold text-sky-400 underline">Retour au site</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="card-metal rounded-[2rem] p-6 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-3xl">✓</span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Merci {order.customerName.split(" ")[0]} !</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300 sm:text-base">
            Commande <strong className="blue-text">{order.orderNumber}</strong> enregistrée. Un accusé a été envoyé à <strong className="text-white">{order.email}</strong>. Notre atelier en Tunisie lance la fabrication.
          </p>

          <ol className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-black ${i <= stepIndex ? "bg-gradient-to-br from-sky-400 to-blue-600 text-white" : "bg-white/10 text-slate-500"}`}>
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                <p className={`mt-1 text-[11px] font-bold capitalize sm:text-xs ${i <= stepIndex ? "text-white" : "text-slate-500"}`}>{s}</p>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-3 h-1.5 max-w-2xl overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-400">Statut : <strong className="capitalize text-white">{order.status}</strong> · Votre commande est sans livraison ; l'atelier vous contactera lorsqu'elle sera prête.</p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card-metal rounded-3xl p-6">
            <h2 className="text-xl font-extrabold text-white">Détail de la commande</h2>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3">
                  <img src={it.imageUrl} alt={it.productName} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-white">{it.productName}</p>
                    <p className="text-slate-400">{it.quantity} × {formatPrice(it.unitPriceCents)}</p>
                  </div>
                  <p className="text-sm font-black text-white">{formatPrice(it.unitPriceCents * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm text-slate-300">
              <p className="flex justify-between"><span>Sous-total</span><span>{formatPrice(order.subtotalCents)}</span></p>
              <p className="flex justify-between"><span>Transport</span><span>Sans livraison</span></p>
              <p className="flex justify-between text-base font-black text-white"><span>Total sans livraison</span><span>{formatPrice(order.totalCents)}</span></p>
            </div>
          </div>

          <div className="card-metal rounded-3xl p-6">
            <h2 className="text-xl font-extrabold text-white">Sans livraison</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              <strong className="text-white">{order.customerName}</strong><br />
              {order.phone && <>{order.phone}<br /></>}
              {order.email}
            </p>
            <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">
              Le montant de la commande ne comprend aucun frais de livraison. Le retrait ou le transport sera organisé et réglé séparément.
            </p>
            {order.notes && <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">📝 « {order.notes} »</p>}
            <div className="mt-4 rounded-2xl border border-sky-400/25 bg-sky-500/10 p-4 text-sm text-sky-100">
              <p className="font-bold text-white">Prochaines étapes</p>
              <ol className="mt-1 list-decimal pl-5 text-[13px] text-slate-300">
                <li>Débit et soudure de votre pièce en atelier</li>
                <li>Thermolaquage et contrôle qualité</li>
                <li>Appel de l'atelier lorsque votre commande est prête</li>
              </ol>
            </div>
            <Link href="/" className="mt-4 block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2.5 text-center text-sm font-extrabold text-white">
              Retour au catalogue
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
