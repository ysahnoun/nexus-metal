"use client";

import { useState } from "react";

const PROJECT_TYPES = [
  "Salon de jardin sur mesure",
  "Fauteuil / mobilier d'assise",
  "Table / plateau sur mesure",
  "Abri, carport ou préau",
  "Charpente métallique / hangar",
  "Mezzanine, escalier, garde-corps",
  "Autre pièce métallique",
];

export default function QuoteModal({
  open,
  onClose,
  presetType,
}: {
  open: boolean;
  onClose: () => void;
  presetType?: string;
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    projectType: presetType ?? PROJECT_TYPES[0],
    dimensions: "",
    budget: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectType: presetType ?? form.projectType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRef(data.quote.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="card-metal relative mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl rounded-3xl p-6 shadow-2xl sm:p-8">
        {ref ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-3xl">✓</span>
            <h3 className="mt-4 text-2xl font-extrabold text-white">Demande envoyée !</h3>
            <p className="mt-2 text-sm text-slate-300">
              Votre référence : <strong className="blue-text text-base">{ref}</strong>
              <br />
              Notre bureau d'études vous rappelle sous 24 h ouvrées avec un chiffrage détaillé.
            </p>
            <button onClick={onClose} className="mt-6 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-500">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Gratuit · sans engagement</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">Demander un devis</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {presetType ? `Projet : ${presetType}` : "Décrivez votre projet, on vous chiffre tout sous 24 h."}
                </p>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg text-white">×</button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-300">
                Nom complet *
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Yassine Benali" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                E-mail *
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@email.fr" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Téléphone
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06 12 34 56 78" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Société (optionnel)
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="SARL Dupont" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              {!presetType && (
                <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                  Type de projet *
                  <select value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-[#111a2b] px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400">
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-sm font-medium text-slate-300">
                Dimensions approximatives
                <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="ex : 6 × 5 m, hauteur 2,5 m" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Budget envisagé
                <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="ex : 3 000 – 5 000 DT" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
              <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                Décrivez votre projet *
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Teinte RAL souhaitée, contraintes de pose, délai, photos disponibles…" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />
              </label>
            </div>

            {error && <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-300">{error}</p>}

            <button disabled={sending} className="mt-5 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/40 hover:from-sky-300 hover:to-blue-500 disabled:opacity-60">
              {sending ? "Envoi en cours…" : "Recevoir mon devis gratuit ⚡"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">Réponse sous 24 h ouvrées · Étude et chiffrage offerts</p>
          </form>
        )}
      </div>
    </div>
  );
}
