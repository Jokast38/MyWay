import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Bank,
  House,
  Heartbeat,
  Train,
  Coffee,
  ArrowRight,
} from "@phosphor-icons/react";

const ICONS = { Bank, House, Heartbeat, Train, Coffee };
const TONES = [
  "bg-blue-50 text-[#1E40AF]",
  "bg-teal-50 text-teal-700",
  "bg-rose-50 text-rose-700",
  "bg-amber-50 text-amber-700",
  "bg-indigo-50 text-indigo-700",
];

export default function InfosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/infos").then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="infos-page">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#4DA3FF]">Informations essentielles</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
          Tout ce qu'il faut savoir pour t'installer
        </h1>
        <p className="mt-3 text-slate-600">
          Des informations claires et pratiques pour vivre sereinement en France.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-20">Chargement…</div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((info, i) => {
            const Icon = ICONS[info.icon] || Bank;
            return (
              <div
                key={info.slug}
                className="rounded-2xl border border-slate-100 bg-white p-6 soft-shadow soft-shadow-hover anim-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
                data-testid={`info-card-${info.slug}`}
              >
                <div className={`inline-flex h-12 w-12 rounded-xl items-center justify-center ${TONES[i % TONES.length]}`}>
                  <Icon size={24} weight="duotone" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{info.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{info.short_description}</p>
                <Link to={`/infos/${info.slug}`}>
                  <Button
                    variant="outline"
                    className="mt-5 rounded-full border-slate-200"
                    data-testid={`info-learn-more-${info.slug}`}
                  >
                    En savoir plus <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
