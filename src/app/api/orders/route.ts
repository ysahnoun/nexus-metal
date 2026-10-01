import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { orderNumber } from "@/lib/format";
import { ensureSeed } from "@/lib/ensure-seed";
import { desc, eq, inArray } from "drizzle-orm";

type CartInput = { slug: string; qty: number };


export async function GET() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
  return NextResponse.json({ orders: rows });
}

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = await req.json();
    const { customerName, email, phone, address, city, postalCode, country, notes, cart } = body as {
      customerName?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      notes?: string;
      cart?: CartInput[];
    };

    if (!customerName || !email) {
      return NextResponse.json({ error: "Nom et adresse e-mail requis." }, { status: 400 });
    }
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const slugs = [...new Set(cart.map((c) => c.slug))];
    const dbProducts = await db.select().from(products).where(inArray(products.slug, slugs));
    const bySlug = new Map(dbProducts.map((p) => [p.slug, p]));

    let subtotal = 0;
    const lines: { productId: string | null; name: string; slug: string; unit: number; qty: number; image: string }[] = [];
    for (const item of cart) {
      const p = bySlug.get(item.slug);
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
      if (!p) continue;
      if ((p.stock ?? 0) < qty) {
        return NextResponse.json({ error: `Stock insuffisant pour « ${p.name} » (reste ${p.stock}).` }, { status: 400 });
      }
      subtotal += p.priceCents * qty;
      lines.push({ productId: p.id, name: p.name, slug: p.slug, unit: p.priceCents, qty, image: p.imageUrl });
    }
    if (lines.length === 0) {
      return NextResponse.json({ error: "Produits introuvables." }, { status: 400 });
    }

    const shipping = 0;
    const total = subtotal;
    const num = orderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: num,
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        address: address?.trim() || "Sans livraison",
        city: city?.trim() || "—",
        postalCode: postalCode?.trim() || "—",
        country: (country || "Tunisie").trim(),
        subtotalCents: subtotal,
        shippingCents: shipping,
        totalCents: total,
        status: "confirmée",
        paymentMethod: "à convenir",
        notes: notes?.trim() || null,
      })
      .returning();

    for (const l of lines) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: l.productId,
        productName: l.name,
        productSlug: l.slug,
        unitPriceCents: l.unit,
        quantity: l.qty,
        imageUrl: l.image,
      });
      const prod = bySlug.get(l.slug);
      if (prod) {
        await db
          .update(products)
          .set({ stock: Math.max(0, (prod.stock ?? 0) - l.qty) })
          .where(eq(products.id, prod.id));
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossible de créer la commande." }, { status: 500 });
  }
}
