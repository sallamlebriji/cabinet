import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { tenantFilter } from "../utils/tenant.js";

export const getStats = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const filter = tenantFilter(req);
  const [clients, employees, appointmentsToday, invoices] = await Promise.all([
    Client.countDocuments(filter),
    User.countDocuments({ ...filter, role: "EMPLOYEE" }),
    Appointment.countDocuments({ ...filter, startAt: { $gte: start, $lt: end } }),
    Invoice.find(filter)
  ]);

  const revenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);

  res.json({
    success: true,
    stats: { clients, employees, appointmentsToday, revenue },
    revenueSeries: [
      { month: "Jan", value: 12000 },
      { month: "Fév", value: 18500 },
      { month: "Mar", value: 16400 },
      { month: "Avr", value: 23100 },
      { month: "Mai", value: 27800 }
    ]
  });
});
