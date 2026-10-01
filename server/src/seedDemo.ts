import mongoose from "mongoose";
import { planLimits } from "./config/modules.js";
import { Appointment } from "./models/Appointment.js";
import { Client } from "./models/Client.js";
import { Invoice } from "./models/Invoice.js";
import { Payment } from "./models/Payment.js";
import { Quote } from "./models/Quote.js";
import { Service } from "./models/Service.js";
import { Setting } from "./models/Setting.js";
import { Subscription } from "./models/Subscription.js";
import { Tenant } from "./models/Tenant.js";
import { User, type UserRole } from "./models/User.js";
import { generateCode, phoneKey } from "./utils/phone.js";

const password = process.env.DEMO_PASSWORD ?? "password123";
const DEMO_PORTAL_CODE = "123456";

export function assertSeedAllowed() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    console.error("Seed de demonstration bloque en production. Definissez ALLOW_DEMO_SEED=true pour l'autoriser.");
    process.exit(1);
  }
}

async function upsertUser(data: {
  name: string;
  email: string;
  role: UserRole;
  tenant?: mongoose.Types.ObjectId;
  phone?: string;
}) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    existing.name = data.name;
    existing.role = data.role;
    existing.tenant = data.tenant;
    existing.phone = data.phone;
    existing.isActive = true;
    existing.password = password;
    await existing.save();
    return existing;
  }

  return User.create({ ...data, password });
}

async function upsertTenant(data: {
  name: string;
  slug: string;
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  email: string;
  phone: string;
  address: string;
  primaryColor?: string;
}) {
  const tenant = await Tenant.findOneAndUpdate(
    { slug: data.slug },
    {
      ...data,
      isActive: true,
      modules: {
        dashboard: true,
        users: true,
        customers: true,
        appointments: true,
        billing: true,
        reports: true,
        settings: true
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Subscription.findOneAndUpdate(
    { tenant: tenant._id },
    {
      tenant: tenant._id,
      plan: data.plan,
      status: "active",
      startDate: new Date(),
      ...planLimits[data.plan],
      enabledModules: ["dashboard", "users", "customers", "appointments", "billing", "reports", "settings"]
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Setting.findOneAndUpdate(
    { $or: [{ tenant: tenant._id }, { slug: data.slug }] },
    {
      tenant: tenant._id,
      cabinetName: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      plan: data.plan === "PRO" ? "pro" : "starter",
      status: "active",
      preferences: { primaryColor: data.primaryColor ?? "#2563eb", currency: "MAD", locale: "fr-MA" },
      openingHours: [
        { day: "Lundi", open: "09:00", close: "18:00", closed: false },
        { day: "Mardi", open: "09:00", close: "18:00", closed: false },
        { day: "Mercredi", open: "09:00", close: "18:00", closed: false },
        { day: "Jeudi", open: "09:00", close: "18:00", closed: false },
        { day: "Vendredi", open: "09:00", close: "17:00", closed: false }
      ]
    },
    { upsert: true, new: true, runValidators: true }
  );

  return tenant;
}

export async function seedDemoData() {
  const atlas = await upsertTenant({
    name: "Cabinet Atlas",
    slug: "cabinet-atlas",
    plan: "PRO",
    email: "contact@cabinet-atlas.ma",
    phone: "+212 522 00 00 00",
    address: "Casablanca, Maroc"
  });
  const ocean = await upsertTenant({
    name: "Cabinet Ocean",
    slug: "cabinet-ocean",
    plan: "STARTER",
    email: "contact@cabinet-ocean.ma",
    phone: "+212 537 00 00 00",
    address: "Rabat, Maroc",
    primaryColor: "#0f766e"
  });

  const [superAdmin, admin, manager, employee] = await Promise.all([
    upsertUser({ name: "Super Admin", email: "superadmin@cabinetpro.ma", role: "SUPER_ADMIN" }),
    upsertUser({ name: "Admin Atlas", email: "admin@cabinetpro.ma", role: "ADMIN_TENANT", tenant: atlas._id, phone: "+212 600 00 00 01" }),
    upsertUser({ name: "Manager Atlas", email: "manager@cabinetpro.ma", role: "MANAGER", tenant: atlas._id, phone: "+212 600 00 00 04" }),
    upsertUser({ name: "Sara Consultante", email: "sara@cabinetpro.ma", role: "EMPLOYEE", tenant: atlas._id, phone: "+212 600 00 00 02" }),
    upsertUser({ name: "Admin Ocean", email: "admin.ocean@cabinetpro.ma", role: "ADMIN_TENANT", tenant: ocean._id, phone: "+212 600 00 00 03" })
  ]);

  const clientPayloads = [
    { firstName: "Amina", lastName: "El Fassi", email: "amina@example.com", phone: "+212 661 11 22 33", address: "Maârif, Casablanca", tags: ["vip"], notes: "Préfère les rendez-vous le matin.", portalCode: DEMO_PORTAL_CODE },
    { firstName: "Karim", lastName: "Bennani", email: "karim@example.com", phone: "+212 662 44 55 66", address: "Gauthier, Casablanca", tags: ["entreprise"], notes: "Suivi mensuel." },
    { firstName: "Salma", lastName: "Idrissi", email: "salma@example.com", phone: "+212 663 77 88 99", tags: ["nouveau"], notes: "Premier contact via le site." },
    { firstName: "Youssef", lastName: "Tazi", email: "youssef@example.com", phone: "+212 664 10 20 30", address: "Anfa, Casablanca", tags: [], notes: "" },
    { firstName: "Nadia", lastName: "Berrada", email: "nadia@example.com", phone: "+212 665 40 50 60", tags: ["vip"], notes: "Dossier complet." },
    { firstName: "Omar", lastName: "Chraibi", email: "omar@example.com", phone: "+212 666 70 80 90", tags: [], notes: "" }
  ];

  const clients: InstanceType<typeof Client>[] = [];
  for (const item of clientPayloads) {
    clients.push(
      await Client.findOneAndUpdate(
        { tenant: atlas._id, email: item.email },
        { portalCode: generateCode(), ...item, phoneKey: phoneKey(item.phone), tenant: atlas._id, createdBy: admin._id },
        { upsert: true, new: true, runValidators: true }
      )
    );
  }

  const servicePayloads = [
    { name: "Consultation initiale", duration: 45, price: 500, description: "Analyse du besoin et ouverture du dossier." },
    { name: "Suivi dossier", duration: 30, price: 300, description: "Point d'avancement et prochaines actions." },
    { name: "Session premium", duration: 60, price: 800, description: "Accompagnement complet avec documents." }
  ];

  const services: InstanceType<typeof Service>[] = [];
  for (const item of servicePayloads) {
    services.push(
      await Service.findOneAndUpdate(
        { tenant: atlas._id, name: item.name },
        { ...item, tenant: atlas._id, isActive: true },
        { upsert: true, new: true, runValidators: true }
      )
    );
  }

  await Appointment.deleteMany({ tenant: atlas._id });
  const slot = (dayOffset: number, hour: number, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  const plan: [number, number, number, number, number, "pending" | "confirmed" | "completed" | "cancelled", "staff" | "online"][] = [
    [-9, 10, 0, 0, 0, "completed", "staff"],
    [-6, 11, 0, 1, 1, "completed", "staff"],
    [-3, 15, 30, 4, 2, "completed", "staff"],
    [-2, 9, 30, 3, 1, "cancelled", "online"],
    [0, 9, 0, 0, 1, "confirmed", "staff"],
    [0, 11, 0, 1, 1, "pending", "online"],
    [0, 14, 30, 5, 0, "confirmed", "staff"],
    [1, 9, 0, 2, 2, "confirmed", "staff"],
    [1, 15, 0, 4, 1, "pending", "online"],
    [2, 10, 30, 3, 0, "confirmed", "staff"],
    [3, 16, 0, 0, 2, "pending", "staff"],
    [5, 11, 30, 5, 1, "confirmed", "staff"]
  ];
  await Appointment.create(
    plan.map(([day, hour, minute, clientIndex, serviceIndex, status, source]) => {
      const startAt = slot(day, hour, minute);
      return {
        tenant: atlas._id,
        client: clients[clientIndex]._id,
        service: services[serviceIndex]._id,
        employee: clientIndex % 2 ? manager._id : employee._id,
        startAt,
        endAt: new Date(startAt.getTime() + services[serviceIndex].duration * 60_000),
        status,
        source
      };
    })
  );

  await Payment.deleteMany({ tenant: atlas._id });
  await Quote.deleteMany({ tenant: atlas._id });
  await Invoice.deleteMany({ $or: [{ tenant: atlas._id }, { number: { $regex: /^(INV|FAC|DEV)-SEED-/ } }] });

  const line = (index: number, quantity = 1) => ({ label: services[index].name, quantity, unitPrice: services[index].price });
  const invoicePlan = [
    { number: "FAC-SEED-001", client: 0, items: [line(0)], paid: 500, daysAgo: 9, method: "card" as const },
    { number: "FAC-SEED-002", client: 1, items: [line(2)], paid: 300, daysAgo: 6, method: "cash" as const },
    { number: "FAC-SEED-003", client: 4, items: [line(2), line(1, 2)], paid: 1400, daysAgo: 35, method: "transfer" as const },
    { number: "FAC-SEED-004", client: 3, items: [line(1)], paid: 0, daysAgo: 2, method: "cash" as const },
    { number: "FAC-SEED-005", client: 5, items: [line(0), line(1)], paid: 800, daysAgo: 64, method: "cheque" as const },
    { number: "FAC-SEED-006", client: 2, items: [line(2)], paid: 800, daysAgo: 95, method: "card" as const }
  ];
  for (const item of invoicePlan) {
    const subtotal = item.items.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
    const createdAt = slot(-item.daysAgo, 12);
    const invoice = await Invoice.create({
      tenant: atlas._id,
      number: item.number,
      client: clients[item.client]._id,
      items: item.items,
      subtotal,
      tax: 0,
      total: subtotal,
      paidAmount: item.paid,
      status: item.paid >= subtotal ? "paid" : item.paid > 0 ? "partial" : "unpaid",
      createdAt
    });
    if (item.paid > 0) {
      await Payment.create({ tenant: atlas._id, invoice: invoice._id, client: clients[item.client]._id, amount: item.paid, method: item.method, paidAt: createdAt, recordedBy: admin._id });
    }
  }

  await Quote.create([
    { tenant: atlas._id, number: "DEV-SEED-001", client: clients[3]._id, items: [line(2, 3)], subtotal: 2400, tax: 0, total: 2400, status: "sent", validUntil: slot(20, 12) },
    { tenant: atlas._id, number: "DEV-SEED-002", client: clients[0]._id, items: [line(0), line(1, 4)], subtotal: 1700, tax: 0, total: 1700, status: "draft", validUntil: slot(30, 12) }
  ]);

  console.log("Seed termine");
  console.log(`Super admin: ${superAdmin.email} / ${password}`);
  console.log(`Admin tenant: ${admin.email} / ${password}`);
  console.log(`Manager: ${manager.email} / ${password}`);
  console.log(`Employe: ${employee.email} / ${password}`);
  console.log(`Portail patient (cabinet-atlas): ${clientPayloads[0].phone} / code ${DEMO_PORTAL_CODE}`);
}

