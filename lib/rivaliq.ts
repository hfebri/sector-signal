/**
 * RivalIQ API Client
 * Base URL: https://api.rivaliq.com/v3
 * Authentication: x-api-key header
 */

const RIVALIQ_BASE_URL = "https://api.rivaliq.com/v3";

if (!process.env.NEXT_RIVALIQ_API_KEY) {
  console.warn("NEXT_RIVALIQ_API_KEY is not set in environment variables");
}

/**
 * Make a request to the RivalIQ API
 */
async function rivaliqFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${RIVALIQ_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": process.env.NEXT_RIVALIQ_API_KEY!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`RivalIQ API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Landscape Types
 */
export interface Landscape {
  id: string;
  name: string;
  companies: Company[];
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  social_accounts?: SocialAccount[];
}

export interface SocialAccount {
  network: string;
  handle: string;
  followers?: number;
}

/**
 * Post Types
 */
export interface Post {
  id: string;
  company_id: string;
  network: string;
  content: string;
  posted_at: string;
  engagement: Engagement;
  media_type?: string;
  url?: string;
}

export interface Engagement {
  likes?: number;
  comments?: number;
  shares?: number;
  total?: number;
}

/**
 * Metrics Types
 */
export interface CompanyMetrics {
  company_id: string;
  company_name: string;
  network: string;
  period: string;
  metrics: {
    followers: number;
    posts: number;
    engagement_total: number;
    engagement_rate: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * API Methods
 */

/**
 * Get all landscapes
 */
export async function getLandscapes(): Promise<Landscape[]> {
  return rivaliqFetch<Landscape[]>("/landscapes");
}

/**
 * Get a specific landscape by ID
 */
export async function getLandscape(landscapeId: string): Promise<Landscape> {
  return rivaliqFetch<Landscape>(`/landscapes/${landscapeId}`);
}

/**
 * Get companies in a landscape
 */
export async function getCompanies(landscapeId: string): Promise<Company[]> {
  return rivaliqFetch<Company[]>(`/landscapes/${landscapeId}/companies`);
}

/**
 * Get posts for a company
 */
export async function getCompanyPosts(
  companyId: string,
  params?: {
    start_date?: string;
    end_date?: string;
    network?: string;
    limit?: number;
  }
): Promise<Post[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.network) queryParams.append("network", params.network);
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString();
  const endpoint = `/companies/${companyId}/posts${query ? `?${query}` : ""}`;

  return rivaliqFetch<Post[]>(endpoint);
}

/**
 * Get metrics for a company
 */
export async function getCompanyMetrics(
  companyId: string,
  params?: {
    start_date?: string;
    end_date?: string;
    network?: string;
  }
): Promise<CompanyMetrics[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.network) queryParams.append("network", params.network);

  const query = queryParams.toString();
  const endpoint = `/companies/${companyId}/metrics${query ? `?${query}` : ""}`;

  return rivaliqFetch<CompanyMetrics[]>(endpoint);
}

/**
 * Get competitive analysis for a landscape
 */
export async function getCompetitiveAnalysis(
  landscapeId: string,
  params?: {
    start_date?: string;
    end_date?: string;
  }
): Promise<{
  landscape: Landscape;
  metrics: CompanyMetrics[];
  topPosts: Post[];
  insights: {
    leader: string;
    avgEngagementRate: number;
    totalPosts: number;
  };
}> {
  const landscape = await getLandscape(landscapeId);
  const companies = await getCompanies(landscapeId);

  // Get metrics for all companies
  const metricsPromises = companies.map((company) =>
    getCompanyMetrics(company.id, params)
  );
  const allMetrics = await Promise.all(metricsPromises);
  const metrics = allMetrics.flat();

  // Get top posts from all companies
  const postsPromises = companies.map((company) =>
    getCompanyPosts(company.id, { ...params, limit: 10 })
  );
  const allPosts = await Promise.all(postsPromises);
  const posts = allPosts.flat();

  // Sort by engagement and get top posts
  const topPosts = posts
    .sort((a, b) => (b.engagement.total || 0) - (a.engagement.total || 0))
    .slice(0, 20);

  // Calculate insights
  const totalEngagementRate = metrics.reduce(
    (sum, m) => sum + m.metrics.engagement_rate,
    0
  );
  const avgEngagementRate = totalEngagementRate / metrics.length || 0;
  const totalPosts = metrics.reduce((sum, m) => sum + m.metrics.posts, 0);

  const leader = metrics.reduce((prev, current) =>
    current.metrics.engagement_total > prev.metrics.engagement_total
      ? current
      : prev
  );

  return {
    landscape,
    metrics,
    topPosts,
    insights: {
      leader: leader.company_name,
      avgEngagementRate,
      totalPosts,
    },
  };
}

/**
 * Analyze competitor content performance
 */
export async function analyzeCompetitorContent(
  companyIds: string[],
  params?: {
    start_date?: string;
    end_date?: string;
  }
): Promise<{
  companies: Array<{
    id: string;
    name: string;
    topPosts: Post[];
    metrics: CompanyMetrics[];
    contentInsights: {
      bestPerformingType: string;
      bestPostingTime: string;
      avgEngagement: number;
    };
  }>;
}> {
  const companiesData = await Promise.all(
    companyIds.map(async (companyId) => {
      const posts = await getCompanyPosts(companyId, { ...params, limit: 50 });
      const metrics = await getCompanyMetrics(companyId, params);

      // Analyze content types
      const typeEngagement: Record<string, number[]> = {};
      posts.forEach((post) => {
        const type = post.media_type || "text";
        if (!typeEngagement[type]) typeEngagement[type] = [];
        typeEngagement[type].push(post.engagement.total || 0);
      });

      const bestPerformingType = Object.entries(typeEngagement).reduce(
        (best, [type, engagements]) => {
          const avg =
            engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
          return avg > (best.avg || 0) ? { type, avg } : best;
        },
        { type: "text", avg: 0 }
      ).type;

      // Analyze posting times
      const hourlyEngagement: Record<number, number[]> = {};
      posts.forEach((post) => {
        const hour = new Date(post.posted_at).getHours();
        if (!hourlyEngagement[hour]) hourlyEngagement[hour] = [];
        hourlyEngagement[hour].push(post.engagement.total || 0);
      });

      const bestPostingTime = Object.entries(hourlyEngagement).reduce(
        (best, [hour, engagements]) => {
          const avg =
            engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
          return avg > (best.avg || 0) ? { hour: parseInt(hour), avg } : best;
        },
        { hour: 12, avg: 0 }
      ).hour;

      const avgEngagement =
        posts.reduce((sum, p) => sum + (p.engagement.total || 0), 0) /
          posts.length || 0;

      const topPosts = posts
        .sort((a, b) => (b.engagement.total || 0) - (a.engagement.total || 0))
        .slice(0, 10);

      return {
        id: companyId,
        name: metrics[0]?.company_name || companyId,
        topPosts,
        metrics,
        contentInsights: {
          bestPerformingType,
          bestPostingTime: `${bestPostingTime}:00`,
          avgEngagement,
        },
      };
    })
  );

  return { companies: companiesData };
}