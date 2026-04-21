import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UsersThree,
  Info,
  CalendarBlank,
  HandHeart,
  ArrowRight,
  MapPin,
} from "@phosphor-icons/react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_1db79e36-3978-4da2-a5e8-96b32f48a33a/artifacts/gs66ko7c_myway-logo.png";

const FEATURES = [
  {
    icon: UsersThree,
    title: "Mise en relation",
    text: "Rencontre d'autres étudiants étrangers, crée ta communauté, brise la solitude.",
    color: "bg-blue-50 text-[#1E40AF]",
  },
  {
    icon: Info,
    title: "Informations essentielles",
    text: "Démarches, logement, santé, transport — tout au même endroit, en français clair.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: CalendarBlank,
    title: "Événements étudiants",
    text: "Soirées d'accueil, ateliers pratiques, visites — participe et intègre-toi.",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: HandHeart,
    title: "Accompagnement simple",
    text: "Des conseils concrets, un parcours guidé pour t'installer sereinement.",
    color: "bg-sky-50 text-sky-700",
  },
];

export default function HomePage() {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="blob"
          style={{ width: 420, height: 420, background: "#BFDBFE", top: -80, right: -60 }}
        />
        <div
          className="blob"
          style={{ width: 320, height: 320, background: "#CCFBF1", bottom: -120, left: -80 }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600">
              <MapPin size={14} weight="fill" className="text-[#4DA3FF]" />
              Pour les étudiants étrangers en France
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-slate-900">
              MyWay —{" "}
              <span className="brand-gradient">Trouve ta place</span>
              <br />
              en France.
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">
              La plateforme qui accompagne les étudiants étrangers dès leur arrivée :
              rencontre, informations, événements et un parcours d'intégration rassurant.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  className="rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6] h-12 px-6 text-base"
                  data-testid="hero-signup-btn"
                >
                  Créer un compte
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-6 text-base border-slate-300"
                  data-testid="hero-login-btn"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              Plus de 200 étudiants déjà accompagnés
            </div>
          </div>

          <div className="relative anim-fade-up" style={{ animationDelay: "120ms" }}>
            <div
              className="absolute -inset-4 brand-gradient-bg opacity-10 rounded-[32px] blur-2xl"
              aria-hidden
            />
            <div className="relative rounded-[28px] overflow-hidden soft-shadow bg-white">
              <img
                src="https://images.pexels.com/photos/7683892/pexels-photo-7683892.jpeg"
                alt="Étudiants internationaux"
                className="w-full h-[440px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl soft-shadow p-4 w-56 border border-slate-100">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="" className="h-10 w-10 object-contain" />
                <div>
                  <div className="text-sm font-semibold">Bienvenue !</div>
                  <div className="text-xs text-slate-500">Ton parcours commence ici</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white border-y border-slate-100" data-testid="home-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold tracking-widest uppercase text-[#4DA3FF]">
              Fonctionnalités clés
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Tout ce dont tu as besoin pour bien démarrer
            </h2>
            <p className="mt-4 text-slate-600">
              Une plateforme simple, pensée pour rendre ton arrivée plus fluide et
              plus humaine.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white border border-slate-100 p-6 soft-shadow soft-shadow-hover anim-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`feature-card-${i}`}
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${f.color}`}>
                  <f.icon size={24} weight="duotone" />
                </div>
                <h3 className="mt-5 font-display font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl brand-gradient-bg p-10 md:p-14 text-white">
            <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
              <div
                className="absolute w-72 h-72 rounded-full"
                style={{ background: "white", filter: "blur(80px)", top: -40, right: -40 }}
              />
            </div>
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
                  Prêt à trouver ta place&nbsp;?
                </h3>
                <p className="mt-3 text-white/85">
                  Rejoins MyWay gratuitement et commence à rencontrer d'autres étudiants,
                  découvrir les bons plans et participer aux événements de ta ville.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/auth?mode=signup">
                  <Button
                    size="lg"
                    className="rounded-full bg-white hover:bg-slate-100 text-[#1E40AF] h-12 px-6"
                    data-testid="cta-signup-btn"
                  >
                    Créer mon compte
                  </Button>
                </Link>
                <Link to="/infos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full bg-transparent border-white/40 text-white hover:bg-white/10 h-12 px-6"
                  >
                    Découvrir les infos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
