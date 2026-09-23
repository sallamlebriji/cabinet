import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Avr", value: 82 },
  { month: "Mai", value: 85 },
  { month: "Jun", value: 84 },
  { month: "Jul", value: 90 },
  { month: "Août", value: 93 },
  { month: "Sep", value: 98 }
];

/**
 * Petite carte "suivi dans le temps" — le même registre que le graphe mensuel de suivi cutané
 * de lovi.care, ici pour la satisfaction patient. Purement décoratif (pas de tooltip/axes),
 * pensé comme un signal de confiance visuel plutôt qu'un vrai tableau de bord.
 */
export function TrendCard() {
  return (
    <div className="glass-panel w-full max-w-xs p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Satisfaction patients</p>
          <p className="display mt-1 text-3xl text-ink">98%</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-extrabold text-sage-700">
          <TrendingUp size={13} /> +6 mois
        </span>
      </div>
      <div className="mt-3 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted">
        {data.map((point) => (
          <span key={point.month}>{point.month}</span>
        ))}
      </div>
    </div>
  );
}
