"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  formatMonthYear,
  getCalendarDays,
  getPreviousMonth,
  getNextMonth,
  DAY_NAMES,
  isWeekend,
  type CalendarDay,
} from "@/lib/calendar-utils";

export type { CalendarDay } from "@/lib/calendar-utils";

export interface CalendarProps {
  month: Date;
  onMonthChange?: (month: Date) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
  children?: (day: CalendarDay) => React.ReactNode;
  showAddButton?: boolean;
  disableOutsideDays?: boolean;
  alwaysShowAddButton?: boolean;
}

export function Calendar({
  month,
  onMonthChange,
  onDateClick,
  className,
  children,
  showAddButton = true,
  disableOutsideDays = true,
  alwaysShowAddButton = false,
}: CalendarProps) {
  const calendarDays = getCalendarDays(month.getFullYear(), month.getMonth());

  const handlePreviousMonth = () => {
    const newMonth = getPreviousMonth(month);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = getNextMonth(month);
    onMonthChange?.(newMonth);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {formatMonthYear(month)}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayOfWeek = index % 7;
          const isWeekendDay = isWeekend(dayOfWeek);
          const childContent = children?.(day);
          const hasContent = childContent !== null && childContent !== undefined;
          const isDisabled = disableOutsideDays && !day.isCurrentMonth;

          return (
            <div
              key={`${day.date.toISOString()}-${index}`}
              className={cn(
                "min-h-[80px] p-1 border rounded-md transition-colors",
                day.isCurrentMonth
                  ? "bg-background border-border"
                  : "bg-muted/30 border-muted-foreground/20",
                day.isToday && "ring-2 ring-primary ring-offset-2",
                isWeekendDay && "bg-muted/50",
                !day.isCurrentMonth && "opacity-50",
                isDisabled && "pointer-events-none"
              )}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    "text-sm font-medium mb-1",
                    day.isToday && "text-primary",
                    !day.isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {day.day}
                </span>
                {hasContent ? (
                  <div className="flex-1 flex flex-col">
                    {childContent}
                    {alwaysShowAddButton && showAddButton && (
                      <button
                        onClick={() => onDateClick?.(day.date)}
                        className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors self-end mt-auto"
                        aria-label={`Add post on ${day.date.toLocaleDateString()}`}
                      >
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ) : showAddButton && day.isCurrentMonth ? (
                  <button
                    onClick={() => onDateClick?.(day.date)}
                    className="flex items-center justify-center w-full h-full rounded hover:bg-muted transition-colors"
                    aria-label={`Add post on ${day.date.toLocaleDateString()}`}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";
