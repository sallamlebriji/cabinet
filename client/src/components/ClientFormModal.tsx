import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Bits";
import { Modal } from "./ui/Modal";
import { useToast } from "./ui/Toast";
import { apiError } from "../lib/format";
import type { Client } from "../lib/types";
import { api } from "../services/api";

const empty = { firstName: "", lastName: "", email: "", phone: "", address: "", birthDate: "", notes: "", tags: "" };

export function ClientFormModal({ open, onClose, onSaved, client }: { open: boolean; onClose: () => void; onSaved: (client: Client) => void; client?: Client | null }) {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      client
        ? {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email ?? "",
            phone: client.phone ?? "",
            address: client.address ?? "",
            birthDate: client.birthDate ? client.birthDate.slice(0, 10) : "",
            notes: client.notes ?? "",
            tags: client.tags?.join(", ") ?? ""
          }
        : empty
    );
  }, [open, client]);

  const set = (field: keyof typeof empty) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    try {
      const { data } = client ? await api.put(`/clients/${client._id}`, payload) : await api.post("/clients", payload);
      toast.ok(client ? "Client mis à jour." : "Client ajouté.");
      onSaved(data.client);
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
      title={client ? "Modifier le client" : "Nouveau client"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="client-form" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom">
          <input required minLength={2} className="app-input" value={form.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Nom">
          <input required minLength={2} className="app-input" value={form.lastName} onChange={set("lastName")} />
        </Field>
        <Field label="Téléphone">
          <input className="app-input" type="tel" placeholder="+212 6…" value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="Email">
          <input className="app-input" type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Date de naissance">
          <input className="app-input" type="date" value={form.birthDate} onChange={set("birthDate")} />
        </Field>
        <Field label="Étiquettes" hint="Séparées par des virgules.">
          <input className="app-input" placeholder="vip, entreprise" value={form.tags} onChange={set("tags")} />
        </Field>
        <Field label="Adresse" className="sm:col-span-2">
          <input className="app-input" value={form.address} onChange={set("address")} />
        </Field>
        <Field label="Notes internes" className="sm:col-span-2">
          <textarea className="app-input" value={form.notes} onChange={set("notes")} />
        </Field>
      </form>
    </Modal>
  );
}
