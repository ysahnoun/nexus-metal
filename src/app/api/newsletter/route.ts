import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
    }
    await db
      .insert(newsletterSubscribers)
      .values({ email: email.trim().toLowerCase() })
      .onConflictDoNothing({ target: newsletterSubscribers.email });
    return NextResponse.json({ ok: true, message: "Bienvenue dans le cercle ! Code -10 % : BIENVENUE10" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Inscription impossible." }, { status: 500 });
  }
}
