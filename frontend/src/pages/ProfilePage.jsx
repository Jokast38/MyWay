import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, MapPin, GraduationCap, Translate, PencilSimple, UsersThree, Plus } from "@phosphor-icons/react";

const INTEREST_OPTIONS = [
  "Musique", "Sport", "Cinéma", "Lecture", "Voyage", "Art", "Cuisine",
  "Photographie", "Tech", "Jeux vidéo", "Danse", "Mode", "Business", "Nature",
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  if (!user) return null;
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  async function uploadPhoto(file) {
    setUploading(true);
    try {
      const sig = (await api.get("/cloudinary/signature", { params: { folder: "users/avatars" } })).data;
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.api_key);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      if (sig.upload_preset) form.append("upload_preset", sig.upload_preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || "Échec upload");
      const updated = (await api.put("/profile", { photo_url: data.secure_url })).data;
      refreshUser(updated);
      toast.success("Photo mise à jour ✨");
    } catch (e) {
      toast.error(e.message || "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="profile-page">
      {/* Header card */}
      <div className="relative rounded-3xl border border-slate-100 soft-shadow bg-white overflow-hidden">
        <div className="h-28 brand-gradient-bg" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-md">
                  <AvatarImage src={user.photo_url || undefined} alt={user.first_name} />
                  <AvatarFallback className="bg-[#EFF6FF] text-[#1E40AF] text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  data-testid="profile-photo-upload-btn"
                  title="Changer la photo"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setEditing(true)}
                data-testid="profile-edit-btn"
              >
                <PencilSimple size={16} /> Modifier mon profil
              </Button>
              <Button
                className="rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
                onClick={() => navigate("/etudiants")}
                data-testid="profile-find-students-btn"
              >
                <UsersThree size={16} /> Trouver des étudiants comme moi
              </Button>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <InfoTile icon={MapPin} label="Pays d'origine" value={user.country} />
            <InfoTile icon={GraduationCap} label="École / Université" value={user.school} />
            <InfoTile icon={Translate} label="Langue parlée" value={user.language} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Section title="À propos">
          {user.bio ? (
            <p className="text-slate-600 leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-slate-400 italic">
              Tu n'as pas encore écrit de bio. Clique sur "Modifier mon profil" pour
              te présenter aux autres étudiants.
            </p>
          )}
        </Section>

        <Section title="Centres d'intérêt">
          {user.interests && user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((i) => (
                <Badge
                  key={i}
                  className="rounded-full bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] font-medium"
                >
                  {i}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">Aucun centre d'intérêt ajouté.</p>
          )}
        </Section>
      </div>

      {editing && (
        <EditProfileDialog
          user={user}
          onClose={() => setEditing(false)}
          onSaved={(u) => {
            refreshUser(u);
            setEditing(false);
            toast.success("Profil mis à jour !");
          }}
        />
      )}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Icon size={14} weight="duotone" className="text-[#4DA3FF]" />
        {label}
      </div>
      <div className="mt-1.5 text-slate-900 font-medium">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white soft-shadow p-6">
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function EditProfileDialog({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    country: user.country,
    school: user.school,
    language: user.language,
    bio: user.bio || "",
    interests: [...(user.interests || [])],
  });
  const [loading, setLoading] = useState(false);
  const [newInterest, setNewInterest] = useState("");

  function toggleInterest(i) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));
  }

  function addCustom() {
    const v = newInterest.trim();
    if (v && !form.interests.includes(v)) {
      setForm((f) => ({ ...f, interests: [...f.interests, v] }));
      setNewInterest("");
    }
  }

  async function save() {
    setLoading(true);
    try {
      const updated = (await api.put("/profile", form)).data;
      onSaved(updated);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Prénom" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <InputField label="Nom" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
          </div>
          <InputField label="Pays d'origine" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <InputField label="École / Université" value={form.school} onChange={(v) => setForm({ ...form, school: v })} />
          <InputField label="Langue parlée" value={form.language} onChange={(v) => setForm({ ...form, language: v })} />
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="rounded-xl"
              placeholder="Présente-toi en quelques mots…"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Centres d'intérêt</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.interests.includes(i)
                      ? "bg-[#4DA3FF] text-white border-[#4DA3FF]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Ajouter un centre d'intérêt"
                className="h-10 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
              />
              <Button type="button" variant="outline" className="rounded-xl" onClick={addCustom}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Annuler
          </Button>
          <Button
            className="rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
            onClick={save}
            disabled={loading}
            data-testid="profile-save-btn"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
    </div>
  );
}
