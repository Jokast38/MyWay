import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { List, X } from "@phosphor-icons/react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_1db79e36-3978-4da2-a5e8-96b32f48a33a/artifacts/gs66ko7c_myway-logo.png";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/etudiants", label: "Étudiants", auth: true },
  { to: "/infos", label: "Infos" },
  { to: "/evenements", label: "Événements" },
  { to: "/messages", label: "Messages", auth: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-100" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-home-link">
            <img src={LOGO_URL} alt="MyWay" className="h-9 w-9 object-contain" />
            <span className="font-display font-bold text-lg tracking-tight brand-gradient">
              myWay
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.filter((n) => !n.auth || user).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-[#1E40AF]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
                data-testid={`nav-link-${n.label.toLowerCase()}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
                    data-testid="nav-user-menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photo_url || undefined} alt={user.first_name} />
                      <AvatarFallback className="bg-[#EFF6FF] text-[#1E40AF] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700">
                      {user.first_name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profil")}
                    data-testid="nav-profile-item"
                  >
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/etudiants")}>
                    Étudiants
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    data-testid="nav-logout-item"
                  >
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="rounded-full text-slate-700"
                  onClick={() => navigate("/auth?mode=login")}
                  data-testid="nav-login-btn"
                >
                  Se connecter
                </Button>
                <Button
                  className="rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
                  onClick={() => navigate("/auth?mode=signup")}
                  data-testid="nav-signup-btn"
                >
                  Créer un compte
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-full hover:bg-slate-100"
            onClick={() => setOpen((o) => !o)}
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1" data-testid="nav-mobile-menu">
            {NAV.filter((n) => !n.auth || user).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-xl text-sm font-medium ${
                    isActive ? "bg-blue-50 text-[#1E40AF]" : "text-slate-600"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="pt-2 flex gap-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      setOpen(false);
                      navigate("/profil");
                    }}
                  >
                    Mon profil
                  </Button>
                  <Button
                    className="flex-1 rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      setOpen(false);
                      navigate("/auth?mode=login");
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    className="flex-1 rounded-full bg-[#4DA3FF] hover:bg-[#3B82F6]"
                    onClick={() => {
                      setOpen(false);
                      navigate("/auth?mode=signup");
                    }}
                  >
                    Créer un compte
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
