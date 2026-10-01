import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/lib/ensure-seed";
import ShopHome from "@/components/shop-home";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeed();
  const rows = await db.select().from(products).orderBy(asc(products.createdAt));
  return <ShopHome initialProducts={rows} />;
}
