import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { desc } from "drizzle-orm";

function quoteRef(): string {
  return `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET() {
  const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(50);
  return NextResponse.json({ quotes: rows });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, string | undefined>;
    const { fullName, email, phone, company, projectType, dimensions, budget, message } = body;

    if (!fullName?.trim() || !email?.trim() || !projectType?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Nom, e-mail, type de projet et description sont requis." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const [row] = await db
      .insert(quotes)
      .values({
        reference: quoteRef(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        projectType: projectType.trim(),
        dimensions: dimensions?.trim() || null,
        budget: budget?.trim() || null,
        message: message.trim(),
        status: "nouveau",
      })
      .returning();

    return NextResponse.json({ quote: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Impossible d'enregistrer la demande de devis." }, { status: 500 });
  }
}
