import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { AppointmentModal } from "../components/AppointmentModal";
import { Segmented } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { addDays, apiError, fmtTime, fullName, startOfDay, toDateInput } from "../lib/format";
import type { Appointment, AppointmentStatus } from "../lib/types";
import { api } from "../services/api";
import { cn } from "../utils/cn";

type View = "week" | "day" | "list";

const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const HOUR_HEIGHT = 56;
const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, index) => FIRST_HOUR + index);

const tone: Record<AppointmentStatus, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-900",
  confirmed: "border-sage-300 bg-sage-50 text-sage-900",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-900",
  cancelled: "border-slate-200 bg-slate-100 text-slate-500 line-through"
};

function monday(date: Date) {
  const day = startOfDay(date);
  return addDays(day, -((day.getDay() + 6) % 7));
}

// Répartit en colonnes les rendez-vous qui se chevauchent dans une même journée.
function layout(items: Appointment[]) {
  const sorted = [...items].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const placed: { item: Appointment; column: number; columns: number }[] = [];
  let cluster: typeof placed = [];
  let clusterEnd = 0;
  const flush = () => {
    const columns = Math.max(...cluster.map((entry) => entry.column)) + 1;
    cluster.forEach((entry) => (entry.columns = columns));
    placed.push(...cluster);
    cluster = [];
  };
  for (const item of sorted) {
    const start = +new Date(item.startAt);
    if (cluster.length && start >= clusterEnd) flush();
    const used = cluster.filter((entry) => +new Date(entry.item.endAt) > start).map((entry) => entry.column);
    let column = 0;
    while (used.includes(column)) column += 1;
    cluster.push({ item, column, columns: 1 });
    clusterEnd = Math.max(clusterEnd, +new Date(item.endAt));
  }
  if (cluster.length) flush();
  return placed;
}

export function Agenda() {
  const toast = useToast();
  const [view, setView] = useState<View>(() => (window.innerWidth < 768 ? "day" : "week"));
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [creatingAt, setCreatingAt] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const range = useMemo(() => {
    if (view === "week") return { from: monday(cursor), days: 7 };
    if (view === "day") return { from: cursor, days: 1 };
    return { from: cursor, days: 30 };
  }, [view, cursor]);

  const load = useCallback(async () => {
    try {
      const to = new Date(addDays(range.from, range.days).getTime() - 1);
      const { data } = await api.get("/appointments", { params: { from: range.from.toISOString(), to: to.toISOString() } });
      setItems(data.items);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [range, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => Array.from({ length: view === "week" ? 7 : 1 }, (_, index) => addDays(range.from, index)), [range.from, view]);
  const step = view === "week" ? 7 : view === "day" ? 1 : 30;
  const today = toDateInput(new Date());

  const title =
    view === "day"
      ? cursor.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? `${range.from.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${addDays(range.from, 6).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
        : `30 jours à partir du ${cursor.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;

  function openCreate(date: Date | null) {
    setEditing(null);
    setCreatingAt(date);
    setModalOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setCreatingAt(null);
    setModalOpen(true);
  }

  function clickColumn(event: React.MouseEvent<HTMLDivElement>, day: Date) {
    if (event.target !== event.currentTarget) return;
    const minutes = Math.floor(((event.nativeEvent.offsetY / HOUR_HEIGHT) * 60) / 30) * 30;
    const date = new Date(day);
    date.setHours(FIRST_HOUR, minutes, 0, 0);
    openCreate(date);
  }

  const counts = {
    total: items.filter((item) => item.status !== "cancelled").length,
    pending: items.filter((item) => item.status === "pending").length
  };

  return (
    <div className="space-y-5 p-4 sm:p-7">
      <PageHeader
        title="Agenda"
        description={`${counts.total} rendez-vous sur la période${counts.pending ? ` · ${counts.pending} à confirmer` : ""}`}
        actions={
          <Button onClick={() => openCreate(null)}>
            <CalendarPlus size={16} /> Nouveau rendez-vous
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setCursor(addDays(cursor, -step))} className="grid h-9 w-9 place-items-center rounded-[10px] border border-hairline bg-white text-slate-600 hover:bg-slate-50" aria-label="Période précédente">
            <ChevronLeft size={17} />
          </button>
          <button type="button" onClick={() => setCursor(addDays(cursor, step))} className="grid h-9 w-9 place-items-center rounded-[10px] border border-hairline bg-white text-slate-600 hover:bg-slate-50" aria-label="Période suivante">
            <ChevronRight size={17} />
          </button>
          <Button variant="secondary" onClick={() => setCursor(startOfDay(new Date()))}>
            Aujourd'hui
          </Button>
        </div>
        <p className="flex-1 text-[15px] font-semibold capitalize text-ink">{title}</p>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "day", label: "Jour" },
            { value: "week", label: "Semaine" },
            { value: "list", label: "Liste" }
          ]}
        />
      </div>

      {view === "list" ? (
        <Card className="overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-muted">Chargement…</p>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th className="hidden md:table-cell">Service</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="cursor-pointer" onClick={() => openEdit(item)}>
                      <td className="whitespace-nowrap">
                        <span className="font-medium capitalize text-ink">{new Date(item.startAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
                        <span className="ml-2 text-muted">
                          {fmtTime(item.startAt)} – {fmtTime(item.endAt)}
                        </span>
                      </td>
                      <td className="font-medium text-ink">
                        {fullName(item.client)}
                        {item.source === "online" && <Globe size={13} className="ml-1.5 inline text-sage-600" aria-label="Réservé en ligne" />}
                      </td>
                      <td className="hidden text-slate-600 md:table-cell">{item.service?.name ?? "—"}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="Aucun rendez-vous sur cette période" />
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="app-scroll max-h-[calc(100vh-270px)] min-h-[420px] overflow-auto">
            <div className={cn("grid", view === "week" ? "min-w-[860px] grid-cols-[56px_repeat(7,minmax(0,1fr))]" : "grid-cols-[56px_minmax(0,1fr)]")}>
              <div className="sticky top-0 z-20 border-b border-hairline bg-white" />
              {days.map((day) => {
                const isToday = toDateInput(day) === today;
                return (
                  <div key={+day} className="sticky top-0 z-20 border-b border-l border-hairline bg-white px-2 py-2.5 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{day.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</p>
                    <p className={cn("app-num mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold", isToday ? "bg-sage-600 text-white" : "text-ink")}>{day.getDate()}</p>
                  </div>
                );
              })}

              <div>
                {hours.map((hour) => (
                  <div key={hour} style={{ height: HOUR_HEIGHT }} className="app-num -translate-y-2 pr-2 text-right text-[11px] text-slate-400">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {days.map((day) => {
                const key = toDateInput(day);
                const dayItems = layout(items.filter((item) => toDateInput(new Date(item.startAt)) === key));
                const now = new Date();
                const nowOffset = key === today ? ((now.getHours() - FIRST_HOUR) * 60 + now.getMinutes()) / 60 : -1;
                return (
                  <div
                    key={key}
                    onClick={(event) => clickColumn(event, day)}
                    className="relative cursor-cell border-l border-hairline"
                    style={{ height: hours.length * HOUR_HEIGHT, backgroundImage: "linear-gradient(to bottom, #eef1f5 1px, transparent 1px)", backgroundSize: `100% ${HOUR_HEIGHT}px` }}
                  >
                    {nowOffset >= 0 && nowOffset <= hours.length && (
                      <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowOffset * HOUR_HEIGHT }}>
                        <span className="-ml-1 h-2 w-2 rounded-full bg-red-500" />
                        <span className="h-px flex-1 bg-red-500" />
                      </div>
                    )}
                    {dayItems.map(({ item, column, columns }) => {
                      const start = new Date(item.startAt);
                      const end = new Date(item.endAt);
                      const top = ((start.getHours() - FIRST_HOUR) * 60 + start.getMinutes()) / 60;
                      const height = Math.max((+end - +start) / 3_600_000, 0.42);
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => openEdit(item)}
                          className={cn("absolute overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left text-[11.5px] leading-tight shadow-card transition hover:z-10 hover:shadow-pop", tone[item.status])}
                          style={{ top: top * HOUR_HEIGHT + 1, height: height * HOUR_HEIGHT - 2, left: `calc(${(column / columns) * 100}% + 3px)`, width: `calc(${100 / columns}% - 6px)` }}
                        >
                          <span className="block truncate font-semibold">
                            {item.source === "online" && <Globe size={11} className="mr-1 inline" />}
                            {fullName(item.client)}
                          </span>
                          <span className="block truncate opacity-80">
                            {fmtTime(start)} · {item.service?.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <AppointmentModal open={modalOpen} appointment={editing} initialStart={creatingAt} onClose={() => setModalOpen(false)} onSaved={() => void load()} />
    </div>
  );
}
