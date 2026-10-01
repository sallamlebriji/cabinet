import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, ChevronLeft, Clock, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Bits";
import { addDays, apiError, money, startOfDay, toDateInput } from "../../lib/format";
import type { Service } from "../../lib/types";
import { publicApi } from "../../services/api";
import { cn } from "../../utils/cn";
import { PublicShell, cabinetSlug } from "./PublicShell";

type Hours = { day: string; open: string; close: string; closed: boolean };
type Cabinet = { name: string; slug: string; phone?: string; email?: string; address?: string; openingHours: Hours[] };
type Busy = { startAt: string; endAt: string };

const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const steps = ["Service", "Créneau", "Coordonnées"];

function atTime(day: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function Booking() {
  const slug = cabinetSlug();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [busy, setBusy] = useState<Busy[] | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    publicApi
      .get(`/public/cabinets/${slug}`)
      .then(({ data }) => {
        setCabinet(data.cabinet);
        setServices(data.services);
      })
      .catch((err) => setLoadError(apiError(err, "Cabinet introuvable.")));
  }, [slug]);

  const hoursFor = (date: Date) => cabinet?.openingHours.find((row) => row.day === dayNames[date.getDay()] && !row.closed);

  const openDays = useMemo(() => {
    if (!cabinet) return [];
    const today = startOfDay(new Date());
    return Array.from({ length: 45 }, (_, index) => addDays(today, index))
      .filter((date) => cabinet.openingHours.some((row) => row.day === dayNames[date.getDay()] && !row.closed))
      .slice(0, 14);
  }, [cabinet]);

  useEffect(() => {
    if (!day) return;
    setBusy(null);
    setSlot(null);
    publicApi
      .get(`/public/cabinets/${slug}/busy`, { params: { from: day.toISOString(), to: addDays(day, 1).toISOString() } })
      .then(({ data }) => setBusy(data.items))
      .catch(() => setBusy([]));
  }, [day, slug]);

  const slots = useMemo(() => {
    if (!day || !service || !busy) return [];
    const hours = hoursFor(day);
    if (!hours) return [];
    const close = atTime(day, hours.close);
    const earliest = Date.now() + 60 * 60 * 1000;
    const result: Date[] = [];
    for (let start = atTime(day, hours.open); +start + service.duration * 60_000 <= +close; start = new Date(+start + 30 * 60_000)) {
      const end = +start + service.duration * 60_000;
      const taken = busy.some((item) => +new Date(item.startAt) < end && +new Date(item.endAt) > +start);
      if (!taken && +start > earliest) result.push(start);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, service, busy, cabinet]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!service || !slot) return;
    setSending(true);
    setError("");
    try {
      await publicApi.post(`/public/cabinets/${slug}/book`, { serviceId: service._id, startAt: slot.toISOString(), ...form });
      setDone(true);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 429 ? "Trop de demandes. Réessayez plus tard ou appelez le cabinet." : status === 422 ? "Vérifiez le nom et le numéro de téléphone saisis." : apiError(err));
      if (status === 409 && day) setDay(new Date(day));
    } finally {
      setSending(false);
    }
  }

  const aside = (
    <Link to={`/portail?cabinet=${slug}`} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
      Espace patient
    </Link>
  );

  if (loadError) {
    return (
      <PublicShell aside={aside}>
        <p className="rounded-xl border border-hairline bg-white p-8 text-center text-sm text-muted">{loadError}</p>
      </PublicShell>
    );
  }
  if (!cabinet) {
    return (
      <PublicShell aside={aside}>
        <p className="text-sm text-muted">Chargement…</p>
      </PublicShell>
    );
  }

  const summary = (
    <aside className="h-fit rounded-[14px] border border-hairline bg-white p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Votre rendez-vous</p>
      <p className="mt-3 font-heading text-xl font-medium text-navy">{cabinet.name}</p>
      <div className="mt-3 space-y-1.5 text-[13px] text-slate-600">
        {cabinet.address && (
          <p className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400" /> {cabinet.address}
          </p>
        )}
        {cabinet.phone && (
          <p className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" /> {cabinet.phone}
          </p>
        )}
      </div>
      <dl className="mt-4 space-y-3 border-t border-hairline pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">Service</dt>
          <dd className="font-medium text-ink">{service ? `${service.name} · ${service.duration} min` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Date et heure</dt>
          <dd className="font-medium capitalize text-ink">
            {slot ? `${slot.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à ${slot.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "—"}
          </dd>
        </div>
        {service && (
          <div>
            <dt className="text-xs text-muted">Tarif indicatif</dt>
            <dd className="app-num font-medium text-ink">{money(service.price)}</dd>
          </div>
        )}
      </dl>
    </aside>
  );

  if (done && slot && service) {
    return (
      <PublicShell cabinetName={cabinet.name} aside={aside}>
        <div className="mx-auto max-w-lg rounded-[14px] border border-hairline bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CalendarCheck size={26} />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-medium text-navy">Demande envoyée</h1>
          <p className="mt-2 text-sm text-slate-600">
            {service.name}, le <span className="font-medium capitalize text-ink">{slot.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span> à{" "}
            <span className="font-medium text-ink">{slot.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>.
          </p>
          <p className="mt-3 text-sm text-muted">Le cabinet doit encore confirmer ce rendez-vous. {cabinet.phone ? `En cas d'empêchement, appelez le ${cabinet.phone}.` : ""}</p>
          <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-[10px] border border-hairline bg-white px-4 text-sm font-medium text-ink shadow-card hover:bg-slate-50">
            Retour au site
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell cabinetName={cabinet.name} aside={aside}>
      <h1 className="font-heading text-[28px] font-medium leading-tight text-navy">Prendre rendez-vous</h1>
      <p className="mt-1 text-sm text-muted">Réservez en trois étapes. Le cabinet confirme ensuite votre demande.</p>

      <ol className="mt-6 flex items-center gap-2 text-[13px]">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold", index < step ? "bg-emerald-600 text-white" : index === step ? "bg-navy text-white" : "bg-slate-200 text-slate-500")}>
              {index < step ? <Check size={13} /> : index + 1}
            </span>
            <span className={cn("font-medium", index === step ? "text-ink" : "text-muted")}>{label}</span>
            {index < steps.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 sm:w-10" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[14px] border border-hairline bg-white p-5 shadow-card sm:p-6">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">
              <ChevronLeft size={15} /> Retour
            </button>
          )}

          {step === 0 &&
            (services.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      setService(item);
                      setStep(1);
                      if (!day && openDays[0]) setDay(openDays[0]);
                    }}
                    className={cn("rounded-xl border p-4 text-left transition hover:border-sage-500 hover:shadow-card", service?._id === item._id ? "border-sage-600 bg-sage-50/50" : "border-hairline")}
                  >
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    {item.description && <p className="mt-1 text-xs text-muted">{item.description}</p>}
                    <p className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {item.duration} min
                      </span>
                      <span className="app-num font-medium text-ink">{money(item.price)}</span>
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">La réservation en ligne n'est pas encore ouverte pour ce cabinet.</p>
            ))}

          {step === 1 && (
            <div>
              <p className="app-label">Jour</p>
              <div className="app-scroll flex gap-2 overflow-x-auto pb-2">
                {openDays.map((date) => {
                  const selected = day && toDateInput(day) === toDateInput(date);
                  return (
                    <button
                      key={+date}
                      type="button"
                      onClick={() => setDay(date)}
                      className={cn("w-16 shrink-0 rounded-xl border py-2 text-center transition", selected ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink hover:border-slate-300")}
                    >
                      <span className={cn("block text-[11px] font-medium uppercase", selected ? "text-white/70" : "text-muted")}>{date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span>
                      <span className="app-num block text-lg font-semibold leading-tight">{date.getDate()}</span>
                      <span className={cn("block text-[11px]", selected ? "text-white/70" : "text-muted")}>{date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span>
                    </button>
                  );
                })}
              </div>

              <p className="app-label mt-5">Heure</p>
              {!busy ? (
                <p className="text-sm text-muted">Recherche des créneaux…</p>
              ) : slots.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {slots.map((date) => (
                    <button
                      key={+date}
                      type="button"
                      onClick={() => setSlot(date)}
                      className={cn("app-num h-10 rounded-[10px] border text-sm font-medium transition", slot && +slot === +date ? "border-sage-600 bg-sage-600 text-white" : "border-hairline bg-white text-ink hover:border-sage-500")}
                    >
                      {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-muted">Aucun créneau libre ce jour-là. Choisissez une autre date.</p>
              )}

              <Button className="mt-6 h-10" disabled={!slot} onClick={() => setStep(2)}>
                Continuer
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom">
                <input required minLength={2} maxLength={60} autoComplete="given-name" className="app-input" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
              </Field>
              <Field label="Nom">
                <input required minLength={2} maxLength={60} autoComplete="family-name" className="app-input" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </Field>
              <Field label="Téléphone">
                <input required type="tel" autoComplete="tel" placeholder="06 12 34 56 78" className="app-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </Field>
              <Field label="Email (optionnel)">
                <input type="email" autoComplete="email" className="app-input" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <Field label="Motif ou précision (optionnel)" className="sm:col-span-2">
                <textarea maxLength={500} className="app-input min-h-20" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </Field>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <Button type="submit" className="h-10" disabled={sending}>
                  {sending ? "Envoi…" : "Confirmer la demande"}
                </Button>
              </div>
            </form>
          )}
        </section>
        {summary}
      </div>
    </PublicShell>
  );
}
