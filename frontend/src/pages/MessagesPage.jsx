import { ChatsCircle } from "@phosphor-icons/react";

export default function MessagesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="messages-page">
      <div className="rounded-3xl bg-white border border-slate-100 soft-shadow p-12 text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl items-center justify-center bg-[#EFF6FF] text-[#1E40AF]">
          <ChatsCircle size={32} weight="duotone" />
        </div>
        <h1 className="mt-5 font-display text-2xl sm:text-3xl font-semibold">
          La messagerie arrive bientôt 💬
        </h1>
        <p className="mt-3 text-slate-600 max-w-lg mx-auto">
          Nous travaillons sur une messagerie en temps réel pour échanger facilement
          avec les autres étudiants. En attendant, envoie une demande de contact depuis
          la page Étudiants.
        </p>
      </div>
    </div>
  );
}
