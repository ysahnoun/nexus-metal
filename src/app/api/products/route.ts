import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/lib/ensure-seed";
import { asc } from "drizzle-orm";

export async function GET() {
  await ensureSeed();
  const rows = await db.select().from(products).orderBy(asc(products.createdAt));
  return NextResponse.json({ products: rows });
}
