# Phase 2: Monthly Planning Feature

## Overview
Monthly planning breaks down the annual strategy into executable monthly editorial plans with detailed content briefs.

## Requirements

### 1. Monthly Strategy
- **Purpose**: Breakdown "always on" content for each month
- **Source**: Reflects content pillars and themes from annual strategy
- **Output**: Monthly editorial plan with content quota and themes

### 2. Monthly Editorial Plan (EP)
- **Content Quota**: Define number of content pieces per month (e.g., 20 content pieces)
- **Platform Distribution**: Breakdown by platform (Instagram, Facebook, TikTok, etc.)
- **Content Types**: Mix of posts, reels, stories, carousels based on annual strategy
- **Theme**: Monthly theme aligned with content pillars

### 3. Content Detail (Content Brief)
Each content piece includes:
- **Title/Name**: e.g., "Reels 4"
- **Link/Asset**: Link to Instagram/platform or asset file
- **Scenes/Structure**:
  - Scene 1 - The Catch: Hook/opening
  - Scene 2 - The Selection: Product showcase
  - Scene 3 - Spotlight: Key feature highlight
  - Scene 4 - End Frame: CTA/closing
- **Visual Description**: Shot-by-shot visual guidance
- **Status**: Draft, In Progress, Approved, Published
- **Asset Status**: Hi-res, Link, Video, etc.
- **Date**: Scheduled publish date
- **Theme/Category**: e.g., "Lifestyle - Smart Choice"
- **Caption**: Full caption text with CTAs
- **Hashtags**: Relevant hashtags for the post

### 4. Reporting
- **Performance Metrics**: Track actual vs planned content
- **Learning**: Key insights from published content
- **Recommendations**: AI-powered suggestions for next month

## Data Structure

### MonthlyPlan
```typescript
interface MonthlyPlan {
  id: string;
  brandId: string;
  strategyId: string; // Links to annual strategy
  month: number; // 1-12
  year: number;
  theme: string;
  contentQuota: {
    total: number;
    byPlatform: {
      platform: string; // instagram, facebook, tiktok, etc.
      count: number;
    }[];
    byType: {
      type: string; // post, reel, story, carousel
      count: number;
    }[];
  };
  contentBriefs: ContentBrief[];
  status: 'draft' | 'approved' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

### ContentBrief
```typescript
interface ContentBrief {
  id: string;
  monthlyPlanId: string;
  title: string; // e.g., "Reels 4"
  contentNumber: number; // 1, 2, 3, etc.
  platform: string;
  type: 'post' | 'reel' | 'story' | 'carousel' | 'video';
  theme: string; // e.g., "Lifestyle - Smart Choice"

  // Visual structure
  scenes: {
    sceneNumber: number;
    title: string; // e.g., "The Catch", "The Selection"
    description: string;
    visualNotes: string;
  }[];

  // Content details
  caption: string;
  hashtags: string[];
  cta?: string;

  // Asset tracking
  assetLink?: string; // Instagram link or file URL
  assetStatus: 'pending' | 'hi-res' | 'link' | 'video' | 'ready';

  // Status tracking
  status: 'draft' | 'in-progress' | 'review' | 'approved' | 'scheduled' | 'published';
  scheduledDate?: Date;
  publishedDate?: Date;

  // Performance (after publishing)
  performance?: {
    reach: number;
    impressions: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### MonthlyReport
```typescript
interface MonthlyReport {
  id: string;
  monthlyPlanId: string;
  brandId: string;
  month: number;
  year: number;

  // Performance summary
  planned: {
    totalContent: number;
    byPlatform: Record<string, number>;
  };
  actual: {
    totalPublished: number;
    byPlatform: Record<string, number>;
  };

  // Aggregate metrics
  totalReach: number;
  totalEngagement: number;
  averageEngagementRate: number;

  // Top performers
  topPerformers: {
    contentBriefId: string;
    title: string;
    platform: string;
    engagementRate: number;
  }[];

  // Learnings (AI-generated)
  learnings: string[];

  // Recommendations for next month (AI-generated)
  recommendations: string[];

  generatedAt: Date;
}
```

## UI Components

### 1. Monthly Planning Dashboard
- Calendar view showing all months
- Quick stats: content planned, published, pending
- Filter by month, platform, status

### 2. Editorial Calendar View
- Grid view showing all content briefs for the month
- Visual preview cards with thumbnail
- Status indicators (draft, in-progress, published)
- Drag-and-drop to reschedule dates

### 3. Content Brief Editor
- Scene-by-scene breakdown editor
- Caption editor with character count
- Hashtag manager
- Asset uploader/link tracker
- Status workflow buttons

### 4. Reporting View
- Performance charts (reach, engagement over time)
- Content type performance comparison
- AI-generated learnings and recommendations
- Export to PDF/Excel

## AI Integration

### Monthly Plan Generation Prompt
```
Input:
- Annual strategy (content pillars, themes, goals)
- Month number (1-12)
- Brand profile
- Previous month's report (if available)

Output:
- Monthly theme aligned with content pillars
- Content quota breakdown
- 20 detailed content briefs with:
  - Titles and themes
  - Scene-by-scene structure
  - Caption drafts
  - Hashtag suggestions
  - Scheduling recommendations
```

### Learning & Recommendations Prompt
```
Input:
- Monthly plan
- Published content performance data
- Annual strategy goals

Output:
- 5-7 key learnings from the month
- 5-7 actionable recommendations for next month
- Content type/theme adjustments
- Platform allocation suggestions
```

## Database Schema

```sql
-- Monthly plans table
CREATE TABLE monthly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES annual_strategies(id) ON DELETE SET NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  theme TEXT NOT NULL,
  content_quota JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(brand_id, month, year)
);

-- Content briefs table
CREATE TABLE content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_number INTEGER NOT NULL,
  platform TEXT NOT NULL,
  type TEXT NOT NULL,
  theme TEXT NOT NULL,
  scenes JSONB NOT NULL,
  caption TEXT,
  hashtags JSONB DEFAULT '[]',
  cta TEXT,
  asset_link TEXT,
  asset_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_date TIMESTAMP,
  published_date TIMESTAMP,
  performance JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Monthly reports table
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  planned JSONB NOT NULL,
  actual JSONB NOT NULL,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  average_engagement_rate DECIMAL(5,2) DEFAULT 0,
  top_performers JSONB DEFAULT '[]',
  learnings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_monthly_plans_brand_date ON monthly_plans(brand_id, year DESC, month DESC);
CREATE INDEX idx_content_briefs_plan ON content_briefs(monthly_plan_id);
CREATE INDEX idx_content_briefs_status ON content_briefs(status);
CREATE INDEX idx_monthly_reports_brand_date ON monthly_reports(brand_id, year DESC, month DESC);
```

## API Endpoints

### Generate Monthly Plan
```
POST /api/monthly/generate
Body: {
  brandId: string,
  strategyId: string,
  month: number,
  year: number
}
Response: {
  success: true,
  plan: MonthlyPlan,
  contentBriefs: ContentBrief[]
}
```

### Get Monthly Plan
```
GET /api/monthly/plan?brandId=xxx&month=1&year=2025
Response: MonthlyPlan with contentBriefs
```

### Update Content Brief
```
PUT /api/monthly/brief/:id
Body: Partial<ContentBrief>
Response: Updated ContentBrief
```

### Generate Monthly Report
```
POST /api/monthly/report/generate
Body: {
  monthlyPlanId: string
}
Response: MonthlyReport with learnings and recommendations
```

## User Flow

1. **Select Month**: User navigates to Monthly Planning and selects a month
2. **Generate Plan**: Click "Generate Monthly Plan" → AI creates 20 content briefs
3. **Review & Edit**: Review generated content briefs, edit scenes, captions, dates
4. **Approve**: Mark plan as "Approved" to lock in the plan
5. **Track Progress**: Update content status as team works (draft → in-progress → published)
6. **Add Performance**: After publishing, add performance metrics
7. **Generate Report**: At month end, generate report with learnings
8. **Apply Learnings**: Use recommendations for next month's plan

## Success Metrics

- Time to create monthly plan: < 5 minutes (vs hours manually)
- Content variety: Mix of content types and themes from annual strategy
- Completion rate: Track % of planned content actually published
- Performance improvement: Month-over-month engagement growth
- Learning retention: AI incorporates previous learnings into new plans
