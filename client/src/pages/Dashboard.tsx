import { CalendarCheck, CreditCard, Users, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";

const data = [
  { month: "Jan", revenue: 12000 },
  { month: "Fev", revenue: 18500 },
  { month: "Mar", revenue: 16400 },
  { month: "Avr", revenue: 23100 },
  { month: "Mai", revenue: 27800 },
  { month: "Juin", revenue: 31500 }
];

export function Dashboard() {
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-kicker">Vue d'ensemble</p>
        <h2 className="mt-2 font-serif text-4xl font-bold tracking-normal text-ink">Dashboard premium</h2>
        <p className="mt-2 text-muted">Vue consolidee des operations, revenus et rendez-vous du cabinet.</p>
      </motion.div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients / patients" value="1 284" trend="+12% ce mois" icon={Users} />
        <StatCard label="Rendez-vous du jour" value="18" trend="7 confirmes" icon={CalendarCheck} />
        <StatCard label="Revenus" value="31 500 MAD" trend="+18% vs mois dernier" icon={Wallet} />
        <StatCard label="Factures payees" value="86%" trend="Excellent recouvrement" icon={CreditCard} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="p-6">
          <h3 className="text-lg font-extrabold text-ink">Revenus dynamiques</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0e5f68" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0e5f68" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ded0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0e5f68" fill="url(#revenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-extrabold text-ink">Rendez-vous du jour</h3>
          <div className="mt-5 space-y-4">
            {["Consultation initiale", "Suivi dossier", "Paiement facture", "Remise documents"].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-line bg-ivory p-4">
                <div>
                  <p className="font-semibold text-ink">{item}</p>
                  <p className="text-sm text-muted">{9 + index}:30</p>
                </div>
                <span className="rounded-full bg-petrol-50 px-3 py-1 text-xs font-bold text-petrol-600">Confirme</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
