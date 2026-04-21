import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bank, House, Heartbeat, Train, Coffee } from "@phosphor-icons/react";

const ICONS = { Bank, House, Heartbeat, Train, Coffee };

export default function InfoDetailPage() {
  const { slug } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/infos/${slug}`)
      .then((r) => setInfo(r.data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center text-slate-500 py-20">Chargement…</div>;
  if (!info) return <div className="text-center text-slate-500 py-20">Catégorie introuvable.</div>;

  const Icon = ICONS[info.icon] || Bank;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/infos">
        <Button variant="ghost" className="rounded-full mb-4 text-slate-600">
          <ArrowLeft size={16} /> Retour aux infos
        </Button>
      </Link>
      <div className="rounded-3xl bg-white border border-slate-100 soft-shadow p-8">
        <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center bg-blue-50 text-[#1E40AF]">
          <Icon size={28} weight="duotone" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold">{info.title}</h1>
        <p className="mt-2 text-slate-500">{info.short_description}</p>
        <div className="mt-6 text-slate-700 leading-relaxed whitespace-pre-line">
          {info.content}
        </div>
      </div>
    </div>
  );
}
