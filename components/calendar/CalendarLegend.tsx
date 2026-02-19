"use client";

import { Badge } from "@/components/ui/badge";
import { getPlatformColor } from "@/lib/calendar-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CalendarLegendProps {
  className?: string;
}

const PLATFORMS = [
  { name: "Instagram", color: "bg-pink-500" },
  { name: "Facebook", color: "bg-blue-600" },
  { name: "LinkedIn", color: "bg-blue-700" },
  { name: "Twitter", color: "bg-sky-500" },
  { name: "TikTok", color: "bg-black dark:bg-white" },
  { name: "YouTube", color: "bg-red-600" },
];

export function CalendarLegend({ className }: CalendarLegendProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Platform Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map((platform) => (
            <div key={platform.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${platform.color}`} />
              <span className="text-xs text-muted-foreground">{platform.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-2 ring-primary" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted/50" />
            <span>Weekend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

CalendarLegend.displayName = "CalendarLegend";
