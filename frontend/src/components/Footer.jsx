const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_1db79e36-3978-4da2-a5e8-96b32f48a33a/artifacts/gs66ko7c_myway-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="MyWay" className="h-9 w-9 object-contain" />
            <span className="font-display font-bold text-lg brand-gradient">myWay</span>
          </div>
          <p className="mt-3 text-sm text-slate-500 max-w-sm">
            La plateforme qui accompagne les étudiants étrangers dès leur arrivée en France.
            Trouve ta place, ta communauté, tes repères.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">Plateforme</div>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Mise en relation</li>
            <li>Informations essentielles</li>
            <li>Événements étudiants</li>
            <li>Accompagnement simple</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">Support</div>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Contact</li>
            <li>Confidentialité</li>
            <li>Conditions</li>
            <li>Paris, France</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} MyWay — Fait avec soin pour les étudiants étrangers en France.
      </div>
    </footer>
  );
}
