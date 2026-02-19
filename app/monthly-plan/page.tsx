"use client";

import { useState, useEffect, useMemo } from "react";
import { useBrand } from "@/lib/brand-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  type CalendarDay,
  formatMonthYear,
  PLATFORM_TEXT_COLORS,
  PLATFORM_BLOCK_COLORS,
} from "@/lib/calendar-utils";
import { PostDetailDialog } from "@/components/calendar/PostDetailDialog";
import { cn } from "@/lib/utils";

interface ContentCalendarPost {
  date: string;
  pillar: string;
  platform: string;
  contentType: string;
  topic: string;
  caption: string;
  hashtags: string[];
  visualBrief: string;
}

interface MonthlyPlan {
  month: string;
  theme: string;
  themeDescription?: string;
  objectives: string[];
  contentCalendar: ContentCalendarPost[];
  keyDates: Array<{
    date: string;
    event: string;
    opportunity: string;
  }>;
}

// Sample data for demonstration
const createSamplePlan = (month: string, year: number): MonthlyPlan => {
  const posts: ContentCalendarPost[] = [];
  const platforms = [
    "Instagram", "Instagram", "Instagram", "Instagram", "Instagram", "Instagram",
    "Instagram", "Instagram", "Instagram", "Instagram", "Instagram", "Instagram",
    "TikTok", "TikTok", "TikTok", "TikTok", "TikTok", "TikTok",
    "Facebook", "Facebook"
  ];
  const contentTypes = [
    "Reels", "Reels", "Reels", "Reels", "Reels", "Reels", "Reels", "Reels",
    "Reels", "Reels", "Story", "Post",
    "Reels", "Reels", "Reels", "Reels", "Reels", "Story",
    "Post", "Post"
  ];
  const pillars = ["Brand Awareness", "Engagement", "Education", "Entertainment"];

  const numPosts = 20;
  const daysInMonth = new Date(
    year,
    ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].indexOf(month) + 1,
    0
  ).getDate();

  const usedDays = new Set<number>();
  while (usedDays.size < numPosts) {
    usedDays.add(Math.floor(Math.random() * daysInMonth) + 1);
  }

  Array.from(usedDays).sort((a, b) => a - b).forEach((day, index) => {
    const monthIndex = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].indexOf(month) + 1;
    const dateStr = `${year}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const platform = platforms[index % platforms.length];
    const contentType = contentTypes[index % contentTypes.length];

    posts.push({
      date: dateStr,
      pillar: pillars[Math.floor(Math.random() * pillars.length)],
      platform,
      contentType,
      topic: `${contentType} ${Math.floor(index / 3) + 1}`,
      caption: `This is a sample caption for the ${contentType.toLowerCase()} on ${month} ${day}.`,
      hashtags: ["#sample", "#demo", "#" + month.toLowerCase()],
      visualBrief: `Sample visual brief for ${month} ${day}`,
    });
  });

  return {
    month: `${month} ${year}`,
    theme: "Driving Joy & Performance",
    themeDescription: "November focus on exhilarating everyday driving and precision engineering",
    objectives: [
      "Increase brand visibility across all platforms",
      "Drive engagement with interactive content",
      "Showcase product features and benefits",
    ],
    contentCalendar: posts,
    keyDates: [],
  };
};

// Count posts by platform
function getPlatformCounts(posts: ContentCalendarPost[]): Record<string, number> {
  const counts: Record<string, number> = {};
  posts.forEach(post => {
    const platform = post.platform.toLowerCase();
    counts[platform] = (counts[platform] || 0) + 1;
  });
  return counts;
}

// Get post number for display (e.g., "Reels 1", "Reels 2")
function getPostLabel(post: ContentCalendarPost, allPosts: ContentCalendarPost[]): string {
  const platformPosts = allPosts.filter(p => p.platform === post.platform);
  const index = platformPosts.findIndex(p => p.date === post.date && p.topic === post.topic);
  const postNumber = index + 1;

  if (post.platform === "Instagram" && post.contentType === "Reels") {
    return `Reels ${postNumber}`;
  } else if (post.platform === "TikTok" && post.contentType === "Story") {
    return `TikTok Story ${postNumber}`;
  } else if (post.platform === "Facebook") {
    return `Facebook Post ${postNumber}`;
  } else if (post.platform === "TikTok") {
    return `Reels ${postNumber + 8}`; // Offset for TikTok as seen in screenshot
  }
  return `${post.contentType} ${postNumber}`;
}

// Get platform block styling
function getPlatformBlockStyle(platform: string): string {
  const normalized = platform.toLowerCase();
  return PLATFORM_BLOCK_COLORS[normalized] || PLATFORM_BLOCK_COLORS.default;
}

// Get platform text color
function getPlatformTextColor(platform: string): string {
  const normalized = platform.toLowerCase();
  return PLATFORM_TEXT_COLORS[normalized] || PLATFORM_TEXT_COLORS.default;
}

export default function MonthlyPlanPage() {
  const { currentBrand } = useBrand();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<ContentCalendarPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize with sample plan for current month
  useEffect(() => {
    const monthName = currentMonth.toLocaleString("default", { month: "long" });
    const year = currentMonth.getFullYear();
    const samplePlan = createSamplePlan(monthName, year);
    setPlans([samplePlan]);
  }, []);

  const currentPlan = plans[currentPlanIndex];
  const platformCounts = useMemo(() => getPlatformCounts(currentPlan?.contentCalendar || []), [currentPlan]);

  if (!currentPlan) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading monthly plan...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePostClick = (post: ContentCalendarPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    // For now just log - in future would open create post dialog
    console.log("Add post on:", date.toISOString().split("T")[0]);
  };

  const handleBackToYear = () => {
    // Navigate to yearly view
    console.log("Navigate to yearly view");
  };

  const handleEditTheme = () => {
    console.log("Edit theme");
  };

  if (!currentBrand) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">No Brand Selected</h2>
            <p className="text-muted-foreground mt-2">
              Please select a brand to view the content calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToYear}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Year
          </Button>
          <h1 className="text-2xl font-bold">
            {formatMonthYear(currentMonth)}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground font-medium uppercase">
          {currentBrand.brandName}
        </div>
      </div>

      {/* Monthly Theme Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Monthly Theme</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentPlan.theme}: {currentPlan.themeDescription}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditTheme}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Post Summary Bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold">
          {currentPlan.contentCalendar.length} total posts
        </span>
        <div className="flex items-center gap-3">
          {Object.entries(platformCounts).map(([platform, count]) => (
            <span
              key={platform}
              className={cn(
                "font-medium",
                getPlatformTextColor(platform)
              )}
            >
              {platform}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        onDateClick={handleDateClick}
        alwaysShowAddButton
      >
        {(day: CalendarDay) => {
          if (!day.isCurrentMonth) return null;

          const dateStr = day.date.toISOString().split("T")[0];
          const dayPosts = currentPlan.contentCalendar.filter(
            (p) => p.date === dateStr
          );

          if (dayPosts.length === 0) return null;

          return (
            <div className="flex flex-col gap-1 overflow-y-auto">
              {dayPosts.slice(0, 3).map((post, index) => (
                <button
                  key={index}
                  onClick={() => handlePostClick(post)}
                  className={cn(
                    "text-left p-1 rounded text-xs transition-colors hover:opacity-80 truncate w-full border",
                    getPlatformBlockStyle(post.platform)
                  )}
                  title={post.topic}
                >
                  <span className="truncate block text-[10px] font-medium">
                    {getPostLabel(post, currentPlan.contentCalendar)}
                  </span>
                  <span className="text-[9px] opacity-70 truncate block">
                    {post.platform.toLowerCase()}
                  </span>
                </button>
              ))}
              {dayPosts.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          );
        }}
      </Calendar>

      {/* Post Detail Dialog */}
      <PostDetailDialog
        post={selectedPost}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
