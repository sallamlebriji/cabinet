import mongoose from "mongoose";
import { planLimits } from "./config/modules.js";
import { connectDatabase } from "./config/db.js";
import { Appointment } from "./models/Appointment.js";
import { Client } from "./models/Client.js";
import { Invoice } from "./models/Invoice.js";
import { Service } from "./models/Service.js";
import { Setting } from "./models/Setting.js";
import { Subscription } from "./models/Subscription.js";
import { Tenant } from "./models/Tenant.js";
import { User, type UserRole } from "./models/User.js";

const password = "password123";

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

async function main() {
  await connectDatabase();

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
    { firstName: "Amina", lastName: "El Fassi", email: "amina@example.com", phone: "+212 661 11 22 33", tags: ["vip"], notes: "Prefere les rendez-vous matin." },
    { firstName: "Karim", lastName: "Bennani", email: "karim@example.com", phone: "+212 662 44 55 66", tags: ["entreprise"], notes: "Suivi mensuel." },
    { firstName: "Salma", lastName: "Idrissi", email: "salma@example.com", phone: "+212 663 77 88 99", tags: ["nouveau"], notes: "Premier contact via site vitrine." }
  ];

  const clients = [];
  for (const item of clientPayloads) {
    clients.push(
      await Client.findOneAndUpdate(
        { tenant: atlas._id, email: item.email },
        { ...item, tenant: atlas._id, createdBy: admin._id },
        { upsert: true, new: true, runValidators: true }
      )
    );
  }

  const servicePayloads = [
    { name: "Consultation initiale", duration: 45, price: 500, description: "Analyse du besoin et ouverture du dossier." },
    { name: "Suivi dossier", duration: 30, price: 300, description: "Point d'avancement et prochaines actions." },
    { name: "Session premium", duration: 60, price: 800, description: "Accompagnement complet avec documents." }
  ];

  const services = [];
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
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  await Appointment.create([
    { tenant: atlas._id, client: clients[0]._id, employee: employee._id, service: services[0]._id, startAt: today, endAt: new Date(today.getTime() + 45 * 60_000), status: "confirmed", notes: "Accueil prioritaire." },
    { tenant: atlas._id, client: clients[1]._id, employee: employee._id, service: services[1]._id, startAt: new Date(today.getTime() + 2 * 60 * 60_000), endAt: new Date(today.getTime() + 2.5 * 60 * 60_000), status: "pending" },
    { tenant: atlas._id, client: clients[2]._id, employee: manager._id, service: services[2]._id, startAt: new Date(today.getTime() + 24 * 60 * 60_000), endAt: new Date(today.getTime() + 25 * 60 * 60_000), status: "completed" }
  ]);

  await Invoice.deleteMany({ $or: [{ tenant: atlas._id }, { number: { $in: ["INV-SEED-001", "INV-SEED-002"] } }] });
  await Invoice.create([
    { tenant: atlas._id, number: "INV-SEED-001", client: clients[0]._id, items: [{ label: services[0].name, quantity: 1, unitPrice: services[0].price }], subtotal: services[0].price, tax: 0, total: services[0].price, paidAmount: services[0].price, status: "paid" },
    { tenant: atlas._id, number: "INV-SEED-002", client: clients[1]._id, items: [{ label: services[2].name, quantity: 1, unitPrice: services[2].price }], subtotal: services[2].price, tax: 0, total: services[2].price, paidAmount: 300, status: "partial" }
  ]);

  console.log("Seed termine");
  console.log(`Super admin: ${superAdmin.email} / ${password}`);
  console.log(`Admin tenant: ${admin.email} / ${password}`);
  console.log(`Manager: ${manager.email} / ${password}`);
  console.log(`Employe: ${employee.email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
