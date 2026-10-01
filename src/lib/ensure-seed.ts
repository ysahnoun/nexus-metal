import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { SEED_PRODUCTS, SEED_REVIEWS } from "@/lib/seed-data";
import { count, eq } from "drizzle-orm";

let seeding: Promise<void> | null = null;

export async function ensureSeed(): Promise<void> {
  if (seeding) return seeding;
  seeding = (async () => {
    try {
      const [{ value }] = await db.select({ value: count() }).from(products);
      if (value > 0) return;
      for (const p of SEED_PRODUCTS) {
        const [inserted] = await db
          .insert(products)
          .values({
            slug: p.slug,
            name: p.name,
            shortDescription: p.shortDescription,
            description: p.description,
            specs: p.specs,
            priceCents: p.priceCents,
            comparePriceCents: p.comparePriceCents ?? null,
            category: p.category,
            imageUrl: p.imageUrl,
            badge: p.badge ?? null,
            stock: p.stock,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            isFeatured: p.isFeatured,
            isQuoteOnly: p.isQuoteOnly ?? false,
          })
          .onConflictDoNothing({ target: products.slug })
          .returning();

        let pid = inserted?.id;
        if (!pid) {
          const existing = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
          pid = existing[0]?.id;
        }
        if (!pid) continue;

        for (const r of SEED_REVIEWS[p.slug] ?? []) {
          await db.insert(reviews).values({
            productId: pid,
            author: r.author,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            verified: true,
          });
        }
      }
    } catch (e) {
      console.error("ensureSeed failed", e);
    }
  })();
  return seeding;
}
