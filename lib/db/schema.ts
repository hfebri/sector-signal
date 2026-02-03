// Database schema definitions for Sector Signal

export interface BrandProfile {
  id: string;
  brandName: string;
  industry: string;
  description: string;
  targetAudience: string;
  brandVoice: string;
  competitors: string[];
  brandValues: string[];
  goals: string;
  rivaliqLandscapeId?: string | null; // RivalIQ landscape ID for competitor tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnualStrategy {
  id: string;
  brandId: string;
  year: number;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  contentPillars: {
    name: string;
    description: string;
    themes: string[];
  }[];
  playbook: {
    toneAndMood: string;
    contentFormats: string[];
    visualStyle: string;
    messagingFramework: string;
  };
  kpiFramework: {
    primaryGoals: string[];
    metrics: {
      name: string;
      target: number;
      timeframe: string;
    }[];
    benchmarks: {
      competitor: string;
      metric: string;
      value: number;
    }[];
  };
  alwaysOnCalendar: MonthlyPlan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyPlan {
  id: string;
  brandId: string;
  strategyId: string;
  month: number;
  year: number;
  theme: string;
  contentQuota: {
    totalPosts: number;
    platformDistribution: {
      platform: string;
      posts: number;
    }[];
  };
  editorialCalendar: ContentItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: string;
  type: 'post' | 'story' | 'reel' | 'carousel' | 'video';
  platform: string;
  scheduledDate: Date;
  concept: string;
  caption: string;
  hashtags: string[];
  visualBrief: string;
  status: 'draft' | 'approved' | 'published';
  performance?: {
    reach: number;
    engagement: number;
    clicks: number;
    shares: number;
  };
}

export interface TacticalCampaign {
  id: string;
  brandId: string;
  name: string;
  type: 'trending' | 'seasonal' | 'news-jacking' | 'product-launch';
  opportunity: {
    description: string;
    timeline: {
      start: Date;
      end: Date;
    };
    competitorGaps: string[];
  };
  recommendation: {
    concept: string;
    contentAssets: string[];
    executionPlan: {
      step: string;
      timeline: string;
      responsible: string;
    }[];
  };
  status: 'opportunity' | 'planned' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorProfile {
  id: string;
  brandId: string;
  name: string;
  industry: string;
  platforms: {
    platform: string;
    handle: string;
    followers: number;
    verified: boolean;
  }[];
  insights: {
    contentTypes: string[];
    postingFrequency: {
      platform: string;
      postsPerWeek: number;
    }[];
    topPerformingContent: {
      type: string;
      engagement: number;
      description: string;
    }[];
    brandVoice: string;
  };
  rivaliqData?: {
    lastSync: Date;
    metrics: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceMetrics {
  id: string;
  brandId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    platform: string;
    followers: number;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
    reach: number;
    impressions: number;
    clicks: number;
    conversions?: number;
  }[];
  competitiveBenchmarks: {
    competitor: string;
    metric: string;
    ourValue: number;
    theirValue: number;
    percentageDifference: number;
  }[];
  insights: string[];
  createdAt: Date;
}

// Type helpers for API responses
export type CreateBrandProfileRequest = Omit<BrandProfile, 'id' | 'createdAt' | 'updatedAt' | 'competitors'> & {
  competitors: string; // Will be parsed into string[]
};

export type UpdateBrandProfileRequest = Partial<CreateBrandProfileRequest>;

export type GenerateStrategyRequest = {
  brandId: string;
  year: number;
  includeCompetitorAnalysis: boolean;
  focusAreas?: string[];
};

export type GenerateMonthlyPlanRequest = {
  brandId: string;
  strategyId: string;
  month: number;
  year: number;
  contentPreferences?: {
    types: string[];
    frequency: number;
  };
};
