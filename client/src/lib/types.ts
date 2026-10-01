export type Client = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  tags?: string[];
  portalCode?: string;
  createdAt?: string;
};

export type Service = { _id: string; name: string; duration: number; price: number; description?: string; isActive?: boolean };

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  source?: "staff" | "online";
  notes?: string;
  client?: Client;
  service?: Service;
  employee?: { _id: string; name: string };
};

export type LineItem = { label: string; quantity: number; unitPrice: number };

export type Invoice = {
  _id: string;
  number: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: "paid" | "unpaid" | "partial";
  createdAt: string;
  client?: Client;
};

export type Quote = {
  _id: string;
  number: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "accepted" | "refused";
  validUntil?: string;
  createdAt: string;
  client?: Client;
  invoice?: { _id: string; number: string };
};

export type PaymentMethod = "cash" | "card" | "transfer" | "cheque";

export type Payment = {
  _id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  reference?: string;
  client?: Client;
  invoice?: { _id: string; number: string };
};

export type StaffRole = "ADMIN_TENANT" | "MANAGER" | "EMPLOYEE";
export type Staff = { _id: string; name: string; email: string; phone?: string; role: StaffRole; isActive: boolean };

export type DocumentFile = { _id: string; title: string; fileUrl: string; fileType: string; size: number; createdAt: string };

export const methodLabels: Record<PaymentMethod, string> = { cash: "Espèces", card: "Carte", transfer: "Virement", cheque: "Chèque" };
export const roleLabels: Record<string, string> = { SUPER_ADMIN: "Super admin", ADMIN_TENANT: "Administrateur", MANAGER: "Manager", EMPLOYEE: "Employé", CLIENT: "Client" };
export const appointmentStatusLabels: Record<AppointmentStatus, string> = { pending: "En attente", confirmed: "Confirmé", completed: "Terminé", cancelled: "Annulé" };
