import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarBlank, MapPin, Star, Check } from "@phosphor-icons/react";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [all, reco] = await Promise.all([
        api.get("/events"),
        user ? api.get("/events/recommended") : Promise.resolve({ data: [] }),
      ]);
      setEvents(all.data);
      setRecommended(reco.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function toggle(id) {
    if (!user) {
      toast.info("Connecte-toi pour participer à un événement.");
      return;
    }
    try {
      const { data } = await api.post(`/events/${id}/participate`);
      toast.success(data.participating ? "Participation confirmée 🎉" : "Participation retirée");
      load();
    } catch (e) {
      toast.error("Impossible de modifier la participation");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="events-page">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#4DA3FF]">Événements</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">Ce qui se passe près de toi</h1>
        <p className="mt-3 text-slate-600">Des rencontres, des ateliers, des sorties — prends part à la vie étudiante.</p>
      </div>

      {user && recommended.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} weight="fill" className="text-amber-500" />
            <h2 className="font-display text-xl font-semibold">Événements recommandés pour toi</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((e) => (
              <EventCard key={e.id} event={e} user={user} onToggle={toggle} highlight />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold mb-4">Tous les événements</h2>
        {loading ? (
          <div className="text-center text-slate-500 py-16">Chargement des événements…</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} user={user} onToggle={toggle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, user, onToggle, highlight }) {
  const d = new Date(event.date);
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const participating = user && event.participants?.includes(user.id);

  return (
    <div
      className={`rounded-2xl bg-white border overflow-hidden soft-shadow soft-shadow-hover ${
        highlight ? "border-blue-100" : "border-slate-100"
      }`}
      data-testid={`event-card-${event.id}`}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 text-center shadow-sm">
          <div className="text-xs font-semibold text-[#1E40AF] uppercase">{month}</div>
          <div className="font-display font-bold text-lg leading-none">{day}</div>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-slate-700 hover:bg-white rounded-full">
            {event.category}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg leading-tight">{event.title}</h3>
        <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">{event.description}</p>
        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CalendarBlank size={14} /> {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" })} • {time}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} /> {event.location}
          </div>
        </div>
        <Button
          onClick={() => onToggle(event.id)}
          className={`mt-4 w-full rounded-full ${
            participating
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-[#4DA3FF] hover:bg-[#3B82F6]"
          }`}
          data-testid={`event-participate-btn-${event.id}`}
        >
          {participating ? (
            <>
              <Check size={16} /> Tu participes
            </>
          ) : (
            "Participer"
          )}
        </Button>
      </div>
    </div>
  );
}
