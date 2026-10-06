import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Storage-safe object key: Supabase rejects spaces, en dashes, parentheses and other non-ASCII. */
export function storageKey(fileName: string, prefix = "") {
  const dot = fileName.lastIndexOf(".")
  const ext = dot > 0 ? fileName.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : ""
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "file"
  return `${prefix}${Date.now()}-${base}${ext}`
}
