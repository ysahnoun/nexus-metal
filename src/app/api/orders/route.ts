import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { orderNumber } from "@/lib/format";
import { ensureSeed } from "@/lib/ensure-seed";
import { eq, inArray } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

type CartInput = {
  slug: string;
  qty: number;
};

export async function POST(req: Request) {
  try {
    await ensureSeed();

    const body = await req.json();

    const {
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      notes,
      cart,
    } = body as {
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
      return NextResponse.json(
        { error: "Nom et adresse e-mail requis." },
        { status: 400 }
      );
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Votre panier est vide." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 400 }
      );
    }

    const slugs = [...new Set(cart.map((item) => item.slug))];

    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.slug, slugs));

    const bySlug = new Map(dbProducts.map((product) => [product.slug, product]));

    let subtotal = 0;

    const lines: {
      productId: string | null;
      name: string;
      slug: string;
      unit: number;
      qty: number;
      image: string;
    }[] = [];

    for (const item of cart) {
      const product = bySlug.get(item.slug);
      const qty = Math.max(
        1,
        Math.min(99, Math.floor(Number(item.qty) || 1))
      );

      if (!product) {
        continue;
      }

      if ((product.stock ?? 0) < qty) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour « ${product.name} » (reste ${product.stock}).`,
          },
          { status: 400 }
        );
      }

      subtotal += product.priceCents * qty;

      lines.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        unit: product.priceCents,
        qty,
        image: product.imageUrl,
      });
    }

    if (lines.length === 0) {
      return NextResponse.json(
        { error: "Produits introuvables." },
        { status: 400 }
      );
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

    for (const line of lines) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: line.productId,
        productName: line.name,
        productSlug: line.slug,
        unitPriceCents: line.unit,
        quantity: line.qty,
        imageUrl: line.image,
      });

      const product = bySlug.get(line.slug);

      if (product) {
        await db
          .update(products)
          .set({
            stock: Math.max(0, (product.stock ?? 0) - line.qty),
          })
          .where(eq(products.id, product.id));
      }
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.ORDER_EMAIL!,
      subject: `Nouvelle commande ${order.orderNumber}`,
      html: `
        <h2>Nouvelle commande Nexus Metal</h2>

        <p><strong>Numéro :</strong> ${order.orderNumber}</p>
        <p><strong>Client :</strong> ${order.customerName}</p>
        <p><strong>E-mail :</strong> ${order.email}</p>
        <p><strong>Téléphone :</strong> ${order.phone || "Non indiqué"}</p>
        <p><strong>Adresse :</strong> ${order.address}</p>
        <p><strong>Ville :</strong> ${order.city}</p>
        <p><strong>Pays :</strong> ${order.country}</p>
        <p><strong>Total :</strong> ${(order.totalCents / 100).toFixed(2)} DT</p>
        <p><strong>Notes :</strong> ${order.notes || "Aucune"}</p>
      `,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Impossible de créer la commande." },
      { status: 500 }
    );
  }
}
