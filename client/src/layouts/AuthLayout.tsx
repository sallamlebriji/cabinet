import { CalendarCheck, FileText, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const highlights = [
  { icon: Users, title: "Dossiers clients centralisés", text: "Contacts, notes et historique au même endroit." },
  { icon: CalendarCheck, title: "Agenda et rendez-vous", text: "Planification et suivi des statuts en temps réel." },
  { icon: FileText, title: "Facturation claire", text: "Factures, paiements et export PDF en un clic." }
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 0%, rgba(37,99,235,0.35), transparent 70%), radial-gradient(50% 45% at 100% 100%, rgba(14,165,233,0.22), transparent 70%)"
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px"
          }}
        />

        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 text-white shadow-sage">
            <Stethoscope size={20} />
          </span>
          <span className="text-base font-semibold text-white">Cabinet Pro</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="display text-5xl text-white">
            La gestion de votre cabinet, <span className="italic text-sage-300">simplement.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/60">Une plateforme unique pour vos clients, vos rendez-vous et votre facturation.</p>
          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-sage-300">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-white/50">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/45">
          <ShieldCheck size={14} /> Données isolées par cabinet et accès par rôle.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sage-500 to-sage-700 text-white">
            <Stethoscope size={18} />
          </span>
          <span className="text-sm font-semibold text-ink">Cabinet Pro</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted">
          <Link to="/" className="hover:text-ink">
            ← Retour au site
          </Link>
        </p>
      </main>
    </div>
  );
}
