import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/New_York';

/**
 * For date-only strings like "2025-06-15".
 * Treats the date as a calendar date (no time shift).
 */
export function formatDateOnly(dateStr: string | null | undefined, fmt = 'MM/dd/yyyy'): string | null {
  if (!dateStr || String(dateStr).trim() === '') return null;
  const match = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  // Construct as noon UTC to avoid any day-boundary shift
  const safeDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return format(safeDate, fmt);
}

/**
 * For ISO 8601 timestamps like "2025-06-15T14:30:00.000Z".
 * Converts to US Eastern before formatting.
 */
export function formatTimestamp(isoStr: string | null | undefined, fmt = 'MM/dd/yyyy h:mm a'): string | null {
  if (!isoStr || String(isoStr).trim() === '') return null;
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return null;
  const eastern = toZonedTime(date, TIMEZONE);
  return format(eastern, fmt);
}
