import { randomInt } from "node:crypto";

// Clé de comparaison : les 9 derniers chiffres, pour ignorer espaces, indicatif et zéro initial.
export function phoneKey(phone: unknown) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(-9) : "";
}

export function generateCode() {
  return String(randomInt(100000, 1000000));
}
