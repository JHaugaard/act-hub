import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escapes a value for use in PocketBase filter queries.
 * Prevents injection attacks by escaping quotes and special characters.
 */
export function escapePocketBaseFilter(value: string): string {
  // PocketBase uses SQL-like syntax - escape single quotes by doubling them
  // Also escape backslashes to prevent escape sequence injection
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "''");
}

/**
 * Validates that a string is a valid PocketBase record ID.
 * PocketBase IDs are 15-character alphanumeric strings.
 */
export function isValidPocketBaseId(id: string): boolean {
  return /^[a-zA-Z0-9]{15}$/.test(id);
}
