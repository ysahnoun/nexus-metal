import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const found = await db
    .select()
    .from(orders)
    .where(or(eq(orders.id, id), eq(orders.orderNumber, id)))
    .limit(1);
  if (!found[0]) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, found[0].id));
  return NextResponse.json({ order: found[0], items });
}
