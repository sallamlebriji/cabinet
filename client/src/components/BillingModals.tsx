import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Field, IconButton } from "./ui/Bits";
import { Modal } from "./ui/Modal";
import { useToast } from "./ui/Toast";
import { apiError, fullName, money, toDateInput } from "../lib/format";
import { methodLabels, type Client, type Invoice, type LineItem, type PaymentMethod, type Service } from "../lib/types";
import { api } from "../services/api";

const blank = (): LineItem => ({ label: "", quantity: 1, unitPrice: 0 });

export function BillingFormModal({
  kind,
  open,
  onClose,
  onSaved,
  clientId
}: {
  kind: "quote" | "invoice";
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientId?: string;
}) {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [client, setClient] = useState("");
  const [items, setItems] = useState<LineItem[]>([blank()]);
  const [taxRate, setTaxRate] = useState(0);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClient(clientId ?? "");
    setItems([blank()]);
    setTaxRate(0);
    setDate("");
    api.get("/clients", { params: { limit: 200 } }).then(({ data }) => setClients(data.items)).catch(() => undefined);
    api.get("/services").then(({ data }) => setServices(data.items)).catch(() => setServices([]));
  }, [open, clientId]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const tax = (subtotal * taxRate) / 100;

  const update = (index: number, patch: Partial<LineItem>) => setItems((current) => current.map((item, position) => (position === index ? { ...item, ...patch } : item)));

  function addService(id: string) {
    const service = services.find((item) => item._id === id);
    if (!service) return;
    const line = { label: service.name, quantity: 1, unitPrice: service.price };
    setItems((current) => (current.length === 1 && !current[0].label ? [line] : [...current, line]));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { client, items, taxRate, ...(kind === "quote" ? { validUntil: date } : { dueDate: date }) };
      await api.post(kind === "quote" ? "/quotes" : "/invoices", body);
      toast.ok(kind === "quote" ? "Devis créé." : "Facture créée.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={kind === "quote" ? "Nouveau devis" : "Nouvelle facture"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="billing-form" disabled={saving}>
            {saving ? "Création…" : kind === "quote" ? "Créer le devis" : "Créer la facture"}
          </Button>
        </>
      }
    >
      <form id="billing-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client">
            <select required className="app-input" value={client} onChange={(event) => setClient(event.target.value)}>
              <option value="">Sélectionner un client</option>
              {clients.map((item) => (
                <option key={item._id} value={item._id}>
                  {fullName(item)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={kind === "quote" ? "Valable jusqu'au" : "Échéance"}>
            <input type="date" className="app-input" min={toDateInput(new Date())} value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="app-label mb-0">Lignes</span>
            {services.length > 0 && (
              <select aria-label="Ajouter un service" className="app-input h-8 w-auto px-2 text-xs" value="" onChange={(event) => addService(event.target.value)}>
                <option value="">+ Ajouter un service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} · {money(service.price)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_64px_104px_32px] items-center gap-2">
                <input required aria-label="Désignation" placeholder="Désignation" className="app-input" value={item.label} onChange={(event) => update(index, { label: event.target.value })} />
                <input required aria-label="Quantité" type="number" min={1} className="app-input px-2 text-center" value={item.quantity} onChange={(event) => update(index, { quantity: Math.max(1, Number(event.target.value)) })} />
                <input required aria-label="Prix unitaire" type="number" min={0} step="0.01" className="app-input px-2 text-right" value={item.unitPrice} onChange={(event) => update(index, { unitPrice: Math.max(0, Number(event.target.value)) })} />
                <IconButton label="Retirer la ligne" tone="danger" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, position) => position !== index))}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setItems((current) => [...current, blank()])} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-sage-600 hover:text-sage-700">
            <Plus size={15} /> Ajouter une ligne
          </button>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Sous-total</span>
            <span className="app-num">{money(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <label className="flex items-center gap-2">
              TVA
              <input aria-label="Taux de TVA" type="number" min={0} max={100} className="app-input h-7 w-16 px-2 text-right text-xs" value={taxRate} onChange={(event) => setTaxRate(Math.min(100, Math.max(0, Number(event.target.value))))} />%
            </label>
            <span className="app-num">{money(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-hairline pt-2 text-base font-semibold text-navy">
            <span>Total</span>
            <span className="app-num">{money(subtotal + tax)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function PaymentModal({ invoice, onClose, onSaved }: { invoice: Invoice | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const remaining = invoice ? Math.max(invoice.total - invoice.paidAmount, 0) : 0;
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paidAt, setPaidAt] = useState(toDateInput(new Date()));
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoice) return;
    setAmount(Math.round(remaining * 100) / 100);
    setMethod("cash");
    setPaidAt(toDateInput(new Date()));
    setReference("");
  }, [invoice, remaining]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!invoice) return;
    setSaving(true);
    try {
      await api.post(`/invoices/${invoice._id}/payments`, { amount, method, paidAt, reference });
      toast.ok("Paiement enregistré.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={Boolean(invoice)}
      onClose={onClose}
      size="sm"
      title="Encaisser un paiement"
      description={invoice ? `${invoice.number} · reste ${money(remaining)}` : undefined}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="payment-form" disabled={saving}>
            {saving ? "Enregistrement…" : "Encaisser"}
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Montant (MAD)">
          <input required type="number" min={0.01} max={remaining} step="0.01" className="app-input" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </Field>
        <Field label="Date">
          <input required type="date" max={toDateInput(new Date())} className="app-input" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
        </Field>
        <Field label="Mode de paiement" className="sm:col-span-2">
          <select className="app-input" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
            {Object.entries(methodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Référence" className="sm:col-span-2" hint="N° de chèque, de virement… (optionnel)">
          <input maxLength={80} className="app-input" value={reference} onChange={(event) => setReference(event.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
