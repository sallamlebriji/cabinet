import PDFDocument from "pdfkit";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Setting } from "../models/Setting.js";
import { ApiError } from "./apiError.js";

type RawItem = { label?: unknown; quantity?: unknown; unitPrice?: unknown };

export function computeTotals(rawItems: unknown, taxRate: unknown) {
  if (!Array.isArray(rawItems) || !rawItems.length) throw new ApiError(StatusCodes.BAD_REQUEST, "Au moins une ligne est requise");
  const items = (rawItems as RawItem[]).map((item) => ({
    label: String(item.label ?? "").trim(),
    quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    unitPrice: Math.max(0, Number(item.unitPrice) || 0)
  }));
  if (items.some((item) => !item.label)) throw new ApiError(StatusCodes.BAD_REQUEST, "Chaque ligne doit avoir un libellé");
  const rate = Math.min(Math.max(Number(taxRate) || 0, 0), 100);
  const subtotal = round(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const tax = round((subtotal * rate) / 100);
  return { items, subtotal, tax, total: round(subtotal + tax) };
}

export function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function statusFor(total: number, paidAmount: number): "paid" | "partial" | "unpaid" {
  if (paidAmount >= total && total > 0) return "paid";
  if (paidAmount > 0) return "partial";
  return "unpaid";
}

const money = (value: number) => `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;

type PdfData = {
  kind: "Facture" | "Devis";
  number: string;
  date: Date;
  tenantId: unknown;
  client?: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string } | null;
  items: { label: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount?: number;
  footer?: string;
};

export async function sendBillingPdf(res: Response, data: PdfData) {
  const cabinet = await Setting.findOne({ tenant: data.tenantId });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${data.number}.pdf`);

  const doc = new PDFDocument({ margin: 48, size: "A4" });
  doc.pipe(res);

  const left = 48;
  const right = 547;

  doc.font("Helvetica-Bold").fontSize(16).fillColor("#12264A").text(cabinet?.cabinetName ?? "Cabinet", left, 48);
  doc.font("Helvetica").fontSize(9).fillColor("#6A788D");
  [cabinet?.address, cabinet?.phone, cabinet?.email].filter(Boolean).forEach((line) => doc.text(String(line)));

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#12264A").text(data.kind, left, 48, { align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#33445C").text(data.number, { align: "right" });
  doc.text(data.date.toLocaleDateString("fr-FR"), { align: "right" });

  doc.moveTo(left, 130).lineTo(right, 130).strokeColor("#E7EBF0").stroke();

  doc.font("Helvetica").fontSize(9).fillColor("#6A788D").text("DESTINATAIRE", left, 146);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#0E1B2E").text(`${data.client?.firstName ?? ""} ${data.client?.lastName ?? ""}`.trim() || "Client");
  doc.font("Helvetica").fontSize(9).fillColor("#33445C");
  [data.client?.address, data.client?.phone, data.client?.email].filter(Boolean).forEach((line) => doc.text(String(line)));

  let y = 230;
  doc.rect(left, y, right - left, 24).fill("#F6F7F9");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#6A788D");
  doc.text("DÉSIGNATION", left + 10, y + 8);
  doc.text("QTÉ", 330, y + 8, { width: 40, align: "right" });
  doc.text("PRIX UNIT.", 380, y + 8, { width: 75, align: "right" });
  doc.text("MONTANT", 460, y + 8, { width: 77, align: "right" });
  y += 34;

  doc.font("Helvetica").fontSize(10).fillColor("#0E1B2E");
  for (const item of data.items) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.text(item.label, left + 10, y, { width: 270 });
    doc.text(String(item.quantity), 330, y, { width: 40, align: "right" });
    doc.text(money(item.unitPrice), 380, y, { width: 75, align: "right" });
    doc.text(money(item.quantity * item.unitPrice), 460, y, { width: 77, align: "right" });
    y += 22;
    doc.moveTo(left, y - 6).lineTo(right, y - 6).strokeColor("#EEF1F5").stroke();
  }

  y += 10;
  const line = (label: string, value: string, bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10).fillColor(bold ? "#12264A" : "#33445C");
    doc.text(label, 330, y, { width: 120, align: "right" });
    doc.text(value, 450, y, { width: 87, align: "right" });
    y += bold ? 24 : 18;
  };
  line("Sous-total", money(data.subtotal));
  line("TVA", money(data.tax));
  line("Total", money(data.total), true);
  if (data.paidAmount !== undefined) {
    line("Déjà réglé", money(data.paidAmount));
    line("Reste à payer", money(Math.max(data.total - data.paidAmount, 0)), true);
  }

  if (data.footer) doc.font("Helvetica").fontSize(9).fillColor("#6A788D").text(data.footer, left, Math.max(y + 30, 700), { width: right - left, align: "center" });

  doc.end();
}
