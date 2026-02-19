"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isSameDay, parseDateString, getPlatformColor, type CalendarDay } from "@/lib/calendar-utils";

export interface ContentCalendarPost {
  date: string;
  pillar: string;
  platform: string;
  contentType: string;
  topic: string;
  caption: string;
  hashtags: string[];
  visualBrief: string;
}

export interface MonthlyPlan {
  month: string;
  theme: string;
  objectives: string[];
  contentCalendar: ContentCalendarPost[];
  keyDates: Array<{
    date: string;
    event: string;
    opportunity: string;
  }>;
}

export interface MonthlyCalendarProps {
  plan: MonthlyPlan;
  onPostClick?: (post: ContentCalendarPost) => void;
  className?: string;
}

export function MonthlyCalendar({
  plan,
  onPostClick,
  className,
}: MonthlyCalendarProps) {
  // Parse the month string to get the Date object
  const monthDate = React.useMemo(() => {
    const monthParts = plan.month.split(" ");
    if (monthParts.length !== 2) return new Date();

    const monthName = monthParts[0];
    const year = parseInt(monthParts[1]);

    if (isNaN(year)) return new Date();

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthIndex = months.indexOf(monthName);
    if (monthIndex === -1) return new Date();

    return new Date(year, monthIndex, 1);
  }, [plan.month]);

  // Group posts by date for quick lookup
  const postsByDate = React.useMemo(() => {
    const map = new Map<string, ContentCalendarPost[]>();
    plan.contentCalendar.forEach((post) => {
      const date = post.date; // Format: "YYYY-MM-DD"
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(post);
    });
    return map;
  }, [plan.contentCalendar]);

  // Get posts for a specific day
  const getPostsForDay = (day: CalendarDay): ContentCalendarPost[] => {
    const dateStr = day.date.toISOString().split("T")[0];
    return postsByDate.get(dateStr) || [];
  };

  const handlePostClick = (post: ContentCalendarPost) => {
    onPostClick?.(post);
  };

  return (
    <Calendar month={monthDate} className={className}>
      {(day) => {
        const posts = getPostsForDay(day);
        if (posts.length === 0 || !day.isCurrentMonth) {
          return null;
        }

        return (
          <div className="flex flex-col gap-1 overflow-y-auto">
            {posts.slice(0, 3).map((post, index) => (
              <button
                key={index}
                onClick={() => handlePostClick(post)}
                className={cn(
                  "text-left p-1 rounded text-xs transition-colors hover:bg-accent",
                  "truncate w-full"
                )}
                title={post.topic}
              >
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      getPlatformColor(post.platform)
                    )}
                  />
                  <span className="truncate flex-1">
                    {post.topic}
                  </span>
                </div>
              </button>
            ))}
            {posts.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{posts.length - 3} more
              </div>
            )}
          </div>
        );
      }}
    </Calendar>
  );
}

MonthlyCalendar.displayName = "MonthlyCalendar";
