import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatApiError } from "@/lib/api";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_1db79e36-3978-4da2-a5e8-96b32f48a33a/artifacts/gs66ko7c_myway-logo.png";

const LANGUAGES = ["Français", "Anglais", "Espagnol", "Arabe", "Portugais", "Chinois", "Japonais", "Italien", "Allemand", "Autre"];

export default function AuthPage() {
  const [params, setParams] = useSearchParams();
  const defaultTab = params.get("mode") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState(defaultTab);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profil", { replace: true });
  }, [user, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="blob" style={{ width: 380, height: 380, background: "#BFDBFE", top: -80, left: -80 }} />
      <div className="blob" style={{ width: 300, height: 300, background: "#CCFBF1", bottom: -100, right: -60 }} />
      <div className="relative max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={LOGO_URL} alt="MyWay" className="h-12 w-12 object-contain" />
            <span className="font-display font-bold text-2xl brand-gradient">myWay</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 soft-shadow p-6 sm:p-8">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setParams({ mode: v }); }}>
            <TabsList className="grid grid-cols-2 rounded-full bg-slate-100 p-1 h-11 mb-6">
              <TabsTrigger
                value="login"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                data-testid="tab-login"
              >
                Se connecter
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                data-testid="tab-signup"
              >
                Créer un compte
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSubmit={login} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSubmit={register} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await onSubmit(email, password);
      toast.success(`Bienvenue ${u.first_name} !`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4" data-testid="login-form">
      <div className="mb-2 text-center">
        <h2 className="font-display text-2xl font-semibold">Content de te revoir 👋</h2>
        <p className="text-sm text-slate-500 mt-1">Connecte-toi à ton espace MyWay.</p>
      </div>
      <Field label="Email">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl"
          placeholder="ton.email@exemple.fr"
          data-testid="login-email-input"
        />
      </Field>
      <Field label="Mot de passe">
        <Input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl"
          placeholder="••••••••"
          data-testid="login-password-input"
        />
      </Field>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6] text-base"
        data-testid="login-submit-btn"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

function SignupForm({ onSubmit }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    country: "",
    school: "",
    language: "Français",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handle(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await onSubmit(form);
      toast.success(`Bienvenue sur MyWay, ${u.first_name} ! Ton aventure commence 🎉`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4" data-testid="signup-form">
      <div className="mb-2 text-center">
        <h2 className="font-display text-2xl font-semibold">Crée ton compte MyWay</h2>
        <p className="text-sm text-slate-500 mt-1">En moins de 60 secondes.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom">
          <Input
            required
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            className="h-11 rounded-xl"
            data-testid="signup-firstname-input"
          />
        </Field>
        <Field label="Nom">
          <Input
            required
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            className="h-11 rounded-xl"
            data-testid="signup-lastname-input"
          />
        </Field>
      </div>
      <Field label="Pays d'origine">
        <Input
          required
          value={form.country}
          onChange={(e) => update("country", e.target.value)}
          className="h-11 rounded-xl"
          placeholder="Ex. Japon, Maroc, Brésil…"
          data-testid="signup-country-input"
        />
      </Field>
      <Field label="École / Université">
        <Input
          required
          value={form.school}
          onChange={(e) => update("school", e.target.value)}
          className="h-11 rounded-xl"
          placeholder="Ex. Sorbonne, HEC, Polytechnique…"
          data-testid="signup-school-input"
        />
      </Field>
      <Field label="Langue parlée">
        <select
          value={form.language}
          onChange={(e) => update("language", e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-[#4DA3FF] focus:border-transparent"
          data-testid="signup-language-select"
        >
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Email">
        <Input
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="h-11 rounded-xl"
          data-testid="signup-email-input"
        />
      </Field>
      <Field label="Mot de passe">
        <Input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="h-11 rounded-xl"
          placeholder="6 caractères minimum"
          data-testid="signup-password-input"
        />
      </Field>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6] text-base"
        data-testid="signup-submit-btn"
      >
        {loading ? "Création…" : "Créer mon compte"}
      </Button>
      <p className="text-xs text-slate-400 text-center">
        En créant un compte, tu acceptes nos conditions d'utilisation.
      </p>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
