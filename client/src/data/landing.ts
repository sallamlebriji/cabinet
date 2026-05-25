import { BarChart3, CalendarCheck, FileText, ShieldCheck, Sparkles, Users } from "lucide-react";

export const services = [
  { title: "Gestion clients", description: "Dossiers, historique, tags et documents centralisés.", icon: Users },
  { title: "Rendez-vous", description: "Calendrier fluide, statuts et rappels internes.", icon: CalendarCheck },
  { title: "Facturation", description: "Factures, paiements et exports PDF en quelques clics.", icon: FileText },
  { title: "Pilotage", description: "Statistiques, revenus et activité du jour en temps réel.", icon: BarChart3 },
  { title: "Sécurité", description: "JWT, rôles, refresh token et protections API.", icon: ShieldCheck },
  { title: "Expérience premium", description: "Interface rapide, élégante et responsive.", icon: Sparkles }
];

export const testimonials = [
  { name: "Nadia K.", role: "Directrice cabinet", quote: "Une interface qui donne immédiatement une sensation de maîtrise et de sérieux." },
  { name: "Yassine B.", role: "Responsable opérations", quote: "Les rendez-vous, paiements et dossiers sont enfin dans un même flux." },
  { name: "Sarah M.", role: "Secrétaire", quote: "La navigation est claire, rapide et pensée pour le quotidien." }
];
