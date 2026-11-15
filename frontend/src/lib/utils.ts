import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return "0.00";
  return val.toFixed(decimals);
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return "0.0%";
  return `${(val * 100).toFixed(1)}%`;
}
