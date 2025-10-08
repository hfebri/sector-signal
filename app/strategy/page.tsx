"use client";

import { useState } from "react";
import { useBrand } from "@/lib/brand-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Target, TrendingUp, Users, FileText, BarChart3 } from "lucide-react";

interface AnnualStrategy {
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  brandPositioning: {
    statement: string;
    differentiators: string[];
    targetAudienceInsights: string[];
  };
  contentPillars: Array<{
    name: string;
    description: string;
    objectives: string[];
    contentTypes: string[];
    frequency: string;
  }>;
  annualGoals: Array<{
    goal: string;
    metric: string;
    target: string;
    timeline: string;
  }>;
  contentPlaybook: {
    toneAndVoice: string[];
    messagingFramework: string[];
    visualGuidelines: string[];
    contentFormats: string[];
  };
  kpiFramework: Array<{
    category: string;
    metrics: string[];
    benchmarks: string;
  }>;
}

export default function StrategyPage() {
  const { currentBrand } = useBrand();
  const [strategy, setStrategy] = useState<AnnualStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategy = async () => {
    if (!currentBrand) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/strategy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: currentBrand.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to generate strategy");
      }

      const data = await response.json();
      setStrategy(data.strategy);

      // Save strategy to localStorage for use in monthly planning
      if (currentBrand) {
        localStorage.setItem(
          `strategy-${currentBrand.id}`,
          JSON.stringify(data.strategy)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Strategy generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBrand) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Brand Selected</CardTitle>
            <CardDescription>
              Please select or create a brand to generate a strategy.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Annual Strategy Generator
            </CardTitle>
            <CardDescription>
              Generate a comprehensive social media strategy for {currentBrand.brandName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">What you'll get:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>SWOT Analysis based on market research</li>
                <li>Brand positioning and differentiators</li>
                <li>3-5 content pillars with posting guidelines</li>
                <li>Annual goals with measurable KPIs</li>
                <li>Content playbook with tone, voice, and visual guidelines</li>
                <li>KPI framework with industry benchmarks</li>
              </ul>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={generateStrategy}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Annual Strategy
                </>
              )}
            </Button>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                This may take 30-60 seconds as we research your industry and competitors...
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
          <h1 className="text-3xl font-bold">Annual Strategy</h1>
          <p className="text-muted-foreground">{currentBrand.brandName}</p>
        </div>
        <Button onClick={generateStrategy} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Regenerate
        </Button>
      </div>

      <Tabs defaultValue="positioning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="pillars">Content Pillars</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="playbook">Playbook</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Brand Positioning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Positioning Statement</h3>
                <p className="text-muted-foreground">{strategy.brandPositioning.statement}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Differentiators</h3>
                <ul className="space-y-2">
                  {strategy.brandPositioning.differentiators.map((diff, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="secondary">{i + 1}</Badge>
                      <span className="text-sm">{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Target Audience Insights</h3>
                <ul className="space-y-2">
                  {strategy.brandPositioning.targetAudienceInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.swotAnalysis.strengths.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.swotAnalysis.weaknesses.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.swotAnalysis.opportunities.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.swotAnalysis.threats.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pillars" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {strategy.contentPillars.map((pillar, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{pillar.name}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Objectives</h4>
                    <ul className="space-y-1">
                      {pillar.objectives.map((obj, j) => (
                        <li key={j} className="text-sm text-muted-foreground">• {obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {pillar.contentTypes.map((type, j) => (
                      <Badge key={j} variant="outline">{type}</Badge>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Frequency:</span> {pillar.frequency}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {strategy.annualGoals.map((goal, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {goal.goal}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Metric:</span>
                    <span className="text-sm font-semibold">{goal.metric}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <Badge>{goal.target}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeline:</span>
                    <span className="text-sm">{goal.timeline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playbook" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tone & Voice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.contentPlaybook.toneAndVoice.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messaging Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.contentPlaybook.messagingFramework.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.contentPlaybook.visualGuidelines.map((item, i) => (
                    <li key={i} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {strategy.contentPlaybook.contentFormats.map((format, i) => (
                    <Badge key={i} variant="secondary">{format}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {strategy.kpiFramework.map((kpi, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {kpi.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Metrics to Track</h4>
                    <div className="flex flex-wrap gap-2">
                      {kpi.metrics.map((metric, j) => (
                        <Badge key={j} variant="outline">{metric}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Industry Benchmarks</h4>
                    <p className="text-sm text-muted-foreground">{kpi.benchmarks}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}