/**
 * Calendar utility functions for date manipulation and calendar display
 */

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Get an array of all days to display in a month view (including padding days)
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const today = new Date();

  const days: CalendarDay[] = [];

  // Add padding days from previous month
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    days.push({
      date: new Date(year, month - 1, day),
      day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  // Add padding days from next month to complete 6-week grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
}

/**
 * Format a date as "Month Year" (e.g., "January 2025")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

/**
 * Format a date as short "Mon DD" (e.g., "Jan 15")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Get the previous month
 */
export function getPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

/**
 * Get the next month
 */
export function getNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Parse a month string like "January 2025" into a Date object
 */
export function parseMonthString(monthStr: string): Date | null {
  const parts = monthStr.split(" ");
  if (parts.length !== 2) return null;

  const monthName = parts[0];
  const year = parseInt(parts[1]);

  if (isNaN(year)) return null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthIndex = months.indexOf(monthName);
  if (monthIndex === -1) return null;

  return new Date(year, monthIndex, 1);
}

/**
 * Parse a date string like "2025-01-15" into a Date object
 */
export function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Months are 0-indexed
  const day = parseInt(parts[2]);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month, day);
}

/**
 * Platform color mappings for calendar indicators - pastel colors to match design
 */
export const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-200 dark:bg-pink-300",
  facebook: "bg-purple-200 dark:bg-purple-300",
  linkedin: "bg-blue-200 dark:bg-blue-300",
  twitter: "bg-sky-200 dark:bg-sky-300",
  tiktok: "bg-cyan-200 dark:bg-cyan-300",
  youtube: "bg-red-200 dark:bg-red-300",
  pinterest: "bg-rose-200 dark:bg-rose-300",
  default: "bg-gray-200 dark:bg-gray-300",
};

/**
 * Platform text color mappings for colored text display
 */
export const PLATFORM_TEXT_COLORS: Record<string, string> = {
  instagram: "text-pink-500 dark:text-pink-400",
  facebook: "text-purple-500 dark:text-purple-400",
  linkedin: "text-blue-500 dark:text-blue-400",
  twitter: "text-sky-500 dark:text-sky-400",
  tiktok: "text-cyan-500 dark:text-cyan-400",
  youtube: "text-red-500 dark:text-red-400",
  pinterest: "text-rose-500 dark:text-rose-400",
  default: "text-gray-500 dark:text-gray-400",
};

/**
 * Platform background color for content blocks (darker than indicator)
 */
export const PLATFORM_BLOCK_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800",
  facebook: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
  linkedin: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
  twitter: "bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800",
  tiktok: "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800",
  youtube: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  pinterest: "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800",
  default: "bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
};

/**
 * Get platform color class
 */
export function getPlatformColor(platform: string): string {
  const normalized = platform.toLowerCase().trim();
  return PLATFORM_COLORS[normalized] || PLATFORM_COLORS.default;
}

/**
 * Day names for calendar header
 */
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Check if a day index is a weekend (0 = Sunday, 6 = Saturday)
 */
export function isWeekend(dayIndex: number): boolean {
  return dayIndex === 0 || dayIndex === 6;
}