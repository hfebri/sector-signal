"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getPlatformColor } from "@/lib/calendar-utils";
import { Calendar, Hash, Image as ImageIcon, AlignLeft } from "lucide-react";
import type { ContentCalendarPost } from "./MonthlyCalendar";

export interface PostDetailDialogProps {
  post: ContentCalendarPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
}: PostDetailDialogProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{post.topic}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {post.date}
              </DialogDescription>
            </div>
            <Badge
              className={cn(
                "shrink-0",
                getPlatformColor(post.platform).replace("bg-", "text-")
              )}
            >
              {post.platform}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Content Type and Pillar */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{post.contentType}</Badge>
              <Badge variant="secondary">{post.pillar}</Badge>
            </div>

            <Separator />

            {/* Caption */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlignLeft className="h-4 w-4" />
                Caption
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.caption}
              </p>
            </div>

            <Separator />

            {/* Visual Brief */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Visual Brief
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.visualBrief}
              </p>
            </div>

            <Separator />

            {/* Hashtags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4" />
                Hashtags
              </div>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

PostDetailDialog.displayName = "PostDetailDialog";
