import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const productId = url.searchParams.get("productId");
  if (slug) {
    const p = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!p[0]) return NextResponse.json({ reviews: [] });
    const rows = await db.select().from(reviews).where(eq(reviews.productId, p[0].id)).orderBy(desc(reviews.createdAt)).limit(20);
    return NextResponse.json({ reviews: rows });
  }
  if (productId) {
    const rows = await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt)).limit(20);
    return NextResponse.json({ reviews: rows });
  }
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(12);
  return NextResponse.json({ reviews: rows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, author, rating, title, comment } = body as {
      slug?: string;
      author?: string;
      rating?: number;
      title?: string;
      comment?: string;
    };
    if (!slug || !author || !title || !comment) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    const r = Math.round(Number(rating));
    if (!r || r < 1 || r > 5) return NextResponse.json({ error: "Note invalide." }, { status: 400 });
    const p = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!p[0]) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    const [row] = await db
      .insert(reviews)
      .values({ productId: p[0].id, author: author.trim().slice(0, 60), rating: r, title: title.trim().slice(0, 120), comment: comment.trim().slice(0, 2000), verified: false })
      .returning();
    await db
      .update(products)
      .set({ reviewsCount: (p[0].reviewsCount ?? 0) + 1 })
      .where(eq(products.id, p[0].id));
    return NextResponse.json({ review: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossible d'enregistrer l'avis." }, { status: 500 });
  }
}
