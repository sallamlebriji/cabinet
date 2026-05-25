import { useEffect, useState } from "react";
import { api } from "../services/api";

export type PublicCabinet = {
  cabinetName: string;
  email?: string;
  phone?: string;
  address?: string;
  openingHours?: { day: string; open: string; close: string; closed: boolean }[];
};

const fallbackCabinet: PublicCabinet = {
  cabinetName: "Cabinet Atlas",
  email: "contact@cabinet-atlas.ma",
  phone: "+212 522 00 00 00",
  address: "Casablanca, Maroc",
  openingHours: [
    { day: "Lundi", open: "09:00", close: "18:00", closed: false },
    { day: "Mardi", open: "09:00", close: "18:00", closed: false },
    { day: "Mercredi", open: "09:00", close: "18:00", closed: false },
    { day: "Jeudi", open: "09:00", close: "18:00", closed: false },
    { day: "Vendredi", open: "09:00", close: "17:00", closed: false }
  ]
};

export function usePublicCabinet() {
  const [cabinet, setCabinet] = useState<PublicCabinet>(fallbackCabinet);

  useEffect(() => {
    api
      .get("/settings/public?slug=cabinet-atlas")
      .then(({ data }) => {
        if (data.settings) setCabinet(data.settings);
      })
      .catch(() => setCabinet(fallbackCabinet));
  }, []);

  return cabinet;
}
