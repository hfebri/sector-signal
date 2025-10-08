"use client";

import { useState } from "react";
import { useBrand } from "@/lib/brand-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface MonthlyPlan {
  month: string;
  theme: string;
  objectives: string[];
  contentCalendar: Array<{
    date: string;
    pillar: string;
    platform: string;
    contentType: string;
    topic: string;
    caption: string;
    hashtags: string[];
    visualBrief: string;
  }>;
  keyDates: Array<{
    date: string;
    event: string;
    opportunity: string;
  }>;
}

export default function MonthlyPlanPage() {
  const { currentBrand } = useBrand();
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [year, setYear] = useState(new Date().getFullYear());
  const [postsPerMonth, setPostsPerMonth] = useState(20);
  const [generateFullYear, setGenerateFullYear] = useState(false);

  const loadStrategy = async () => {
    if (!currentBrand) return;

    try {
      // Try to load existing strategy from localStorage or generate new one
      const savedStrategy = localStorage.getItem(`strategy-${currentBrand.id}`);
      if (savedStrategy) {
        setStrategy(JSON.parse(savedStrategy));
      } else {
        setError("Please generate an annual strategy first from the Strategy page.");
      }
    } catch (err) {
      setError("Failed to load strategy");
    }
  };

  const generatePlan = async () => {
    if (!currentBrand || !strategy) {
      await loadStrategy();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monthly-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: currentBrand.id,
          strategy,
          month: generateFullYear ? undefined : month,
          year: generateFullYear ? undefined : year,
          postsPerMonth,
          generateFullYear,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to generate monthly plan");
      }

      const data = await response.json();

      if (generateFullYear) {
        setPlans(data.plans);
        setCurrentPlanIndex(0);
      } else {
        setPlans([data.plan]);
        setCurrentPlanIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Monthly plan generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans[currentPlanIndex];

  const nextPlan = () => {
    if (currentPlanIndex < plans.length - 1) {
      setCurrentPlanIndex(currentPlanIndex + 1);
    }
  };

  const prevPlan = () => {
    if (currentPlanIndex > 0) {
      setCurrentPlanIndex(currentPlanIndex - 1);
    }
  };

  if (!currentBrand) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Brand Selected</CardTitle>
            <CardDescription>
              Please select or create a brand to generate monthly plans.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!strategy && !loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Required</CardTitle>
            <CardDescription>
              You need to generate an annual strategy before creating monthly plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadStrategy}>
              Load Strategy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Monthly Content Plan Generator
            </CardTitle>
            <CardDescription>
              Generate detailed content calendars for {currentBrand.brandName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fullYear"
                  checked={generateFullYear}
                  onChange={(e) => setGenerateFullYear(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="fullYear">Generate full 12-month calendar</Label>
              </div>

              {!generateFullYear && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <select
                      id="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="posts">Posts per month</Label>
                <Input
                  id="posts"
                  type="number"
                  value={postsPerMonth}
                  onChange={(e) => setPostsPerMonth(parseInt(e.target.value))}
                  min={5}
                  max={50}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={generatePlan}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {generateFullYear ? "12-Month Calendar" : "Monthly Plan"}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {generateFullYear ? "12-Month Calendar" : "Monthly Plan"}
                </>
              )}
            </Button>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                {generateFullYear
                  ? "This will take 3-5 minutes to generate all 12 months..."
                  : "This may take 30-60 seconds..."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentPlan.month}</h1>
          <p className="text-muted-foreground">{currentBrand.brandName}</p>
        </div>
        <div className="flex gap-2">
          {plans.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={prevPlan}
                disabled={currentPlanIndex === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPlanIndex + 1} / {plans.length}
              </span>
              <Button
                onClick={nextPlan}
                disabled={currentPlanIndex === plans.length - 1}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button onClick={generatePlan} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Theme</CardTitle>
          <CardDescription className="text-lg">{currentPlan.theme}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Objectives</h3>
          <ul className="space-y-1">
            {currentPlan.objectives.map((obj, i) => (
              <li key={i} className="text-sm">• {obj}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {currentPlan.keyDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Dates & Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPlan.keyDates.map((kd, i) => (
                <div key={i} className="border-l-2 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{kd.date}</Badge>
                    <span className="font-semibold">{kd.event}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{kd.opportunity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlan.contentCalendar.map((post, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{post.date}</CardTitle>
                    <Badge variant="secondary">{post.platform}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {post.pillar} • {post.contentType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{post.topic}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {post.caption}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1">Visual:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.visualBrief}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.hashtags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {currentPlan.contentCalendar.map((post, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{post.topic}</CardTitle>
                    <CardDescription>
                      {post.date} • {post.platform} • {post.contentType}
                    </CardDescription>
                  </div>
                  <Badge>{post.pillar}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Caption</h4>
                  <p className="text-sm">{post.caption}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Visual Brief</h4>
                  <p className="text-sm text-muted-foreground">{post.visualBrief}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, j) => (
                      <Badge key={j} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}