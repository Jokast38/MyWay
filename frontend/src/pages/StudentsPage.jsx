import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MagnifyingGlass, Funnel, EnvelopeSimple, X } from "@phosphor-icons/react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ countries: [], schools: [], languages: [], interests: [] });
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState({ country: "", school: "", language: "", interest: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/students/filters").then((r) => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/students", { params: { ...pickedParams(picked), q: q || undefined } })
      .then((r) => setStudents(r.data))
      .finally(() => setLoading(false));
  }, [picked, q]);

  const active = Object.values(picked).filter(Boolean).length + (q ? 1 : 0);

  function clearFilters() {
    setPicked({ country: "", school: "", language: "", interest: "" });
    setQ("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="students-page">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#4DA3FF]">Communauté</div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">Rencontre d'autres étudiants</h1>
          <p className="mt-2 text-slate-600 max-w-xl">
            Filtre par pays, école, langue ou centres d'intérêt pour trouver des étudiants
            comme toi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un étudiant…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11 rounded-full bg-white"
              data-testid="students-search-input"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white soft-shadow p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Funnel size={18} className="text-[#4DA3FF]" weight="duotone" />
          <span className="text-sm font-semibold">Filtres</span>
          {active > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
              data-testid="students-clear-filters"
            >
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect label="Pays" options={filters.countries} value={picked.country} onChange={(v) => setPicked({ ...picked, country: v })} testid="filter-country" />
          <FilterSelect label="École" options={filters.schools} value={picked.school} onChange={(v) => setPicked({ ...picked, school: v })} testid="filter-school" />
          <FilterSelect label="Langue" options={filters.languages} value={picked.language} onChange={(v) => setPicked({ ...picked, language: v })} testid="filter-language" />
          <FilterSelect label="Centre d'intérêt" options={filters.interests} value={picked.interest} onChange={(v) => setPicked({ ...picked, interest: v })} testid="filter-interest" />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-20">Chargement des profils…</div>
      ) : students.length === 0 ? (
        <div className="text-center text-slate-500 py-20">Aucun étudiant ne correspond à ces filtres.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {students.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function pickedParams(p) {
  const o = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v) o[k] = v;
  });
  return o;
}

function FilterSelect({ label, options, value, onChange, testid }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-[#4DA3FF] focus:border-transparent"
        data-testid={testid}
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function StudentCard({ student }) {
  const initials = `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();
  return (
    <div
      className="group rounded-2xl border border-slate-100 bg-white p-5 soft-shadow soft-shadow-hover"
      data-testid={`student-card-${student.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={student.photo_url || undefined} alt={student.first_name} />
          <AvatarFallback className="bg-[#EFF6FF] text-[#1E40AF] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-display font-semibold truncate">
            {student.first_name} {student.last_name}
          </div>
          <div className="text-xs text-slate-500 truncate">{student.country} • {student.language}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
        {student.bio || "Pas encore de bio."}
      </div>
      <div className="mt-3 text-xs text-slate-500 truncate">
        🎓 {student.school}
      </div>
      {student.interests?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {student.interests.slice(0, 3).map((i) => (
            <Badge key={i} className="rounded-full bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] font-medium text-[11px]">
              {i}
            </Badge>
          ))}
        </div>
      )}
      <Button
        className="mt-4 w-full rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
        onClick={() => toast.info(`Messagerie bientôt disponible — message envoyé à ${student.first_name} ✉️`)}
        data-testid={`student-message-btn-${student.id}`}
      >
        <EnvelopeSimple size={16} /> Envoyer un message
      </Button>
    </div>
  );
}
