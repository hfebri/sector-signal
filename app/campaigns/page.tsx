"use client";

import { useState } from "react";
import { useBrand } from "@/lib/brand-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, TrendingUp, Target, Calendar, Lightbulb } from "lucide-react";

interface TacticalCampaign {
  opportunity: {
    type: string;
    description: string;
    urgency: "low" | "medium" | "high";
    relevanceScore: number;
  };
  campaignConcept: {
    name: string;
    objective: string;
    strategy: string;
    targetAudience: string;
  };
  contentAssets: Array<{
    platform: string;
    contentType: string;
    concept: string;
    callToAction: string;
  }>;
  timeline: {
    start: string;
    end: string;
    phases: Array<{
      phase: string;
      actions: string[];
    }>;
  };
  expectedOutcomes: string[];
}

export default function CampaignsPage() {
  const { currentBrand } = useBrand();
  const [campaigns, setCampaigns] = useState<TacticalCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [campaignCount, setCampaignCount] = useState(3);

  const loadStrategy = async () => {
    if (!currentBrand) return;

    try {
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

  const generateCampaigns = async () => {
    if (!currentBrand || !strategy) {
      await loadStrategy();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: currentBrand.id,
          strategy,
          count: campaignCount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to generate campaigns");
      }

      const data = await response.json();

      if (data.campaigns) {
        setCampaigns(data.campaigns);
      } else if (data.campaign) {
        setCampaigns([data.campaign]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Campaign generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!currentBrand) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Brand Selected</CardTitle>
            <CardDescription>
              Please select or create a brand to generate campaigns.
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
              You need to generate an annual strategy before creating tactical campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadStrategy}>Load Strategy</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Tactical Campaign Generator
            </CardTitle>
            <CardDescription>
              Generate AI-powered campaign recommendations for {currentBrand.brandName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">What you'll get:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Market opportunity detection with real-time trend analysis</li>
                <li>Campaign concepts aligned with brand strategy</li>
                <li>Content asset recommendations for each platform</li>
                <li>Timeline and execution phases</li>
                <li>Expected outcomes and KPIs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of campaign ideas</Label>
              <Input
                id="count"
                type="number"
                value={campaignCount}
                onChange={(e) => setCampaignCount(parseInt(e.target.value))}
                min={1}
                max={5}
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={generateCampaigns}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {campaignCount} Campaign{campaignCount > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Campaign Ideas
                </>
              )}
            </Button>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                Analyzing market trends and opportunities... This may take 1-2 minutes per campaign.
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
          <h1 className="text-3xl font-bold">Tactical Campaigns</h1>
          <p className="text-muted-foreground">{currentBrand.brandName}</p>
        </div>
        <Button onClick={generateCampaigns} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Generate More
        </Button>
      </div>

      <div className="space-y-6">
        {campaigns.map((campaign, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {campaign.campaignConcept.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {campaign.campaignConcept.objective}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <Badge className={getUrgencyColor(campaign.opportunity.urgency)}>
                    {campaign.opportunity.urgency.toUpperCase()} URGENCY
                  </Badge>
                  <Badge variant="outline">
                    Relevance: {campaign.opportunity.relevanceScore}/10
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs defaultValue="opportunity" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
                  <TabsTrigger value="strategy">Strategy</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                </TabsList>

                <TabsContent value="opportunity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Market Opportunity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Type</h4>
                        <Badge>{campaign.opportunity.type}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.opportunity.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Campaign Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Strategy</h4>
                        <p className="text-sm">{campaign.campaignConcept.strategy}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Target Audience</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.campaignConcept.targetAudience}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.contentAssets.map((asset, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{asset.platform}</CardTitle>
                            <Badge variant="secondary">{asset.contentType}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Concept</h4>
                            <p className="text-sm text-muted-foreground">{asset.concept}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Call to Action</h4>
                            <Badge variant="outline">{asset.callToAction}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Execution Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Start Date</h4>
                          <Badge variant="outline">{campaign.timeline.start}</Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">End Date</h4>
                          <Badge variant="outline">{campaign.timeline.end}</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Phases</h4>
                        <div className="space-y-4">
                          {campaign.timeline.phases.map((phase, i) => (
                            <div key={i} className="border-l-2 border-primary pl-4">
                              <h5 className="font-semibold text-sm mb-2">{phase.phase}</h5>
                              <ul className="space-y-1">
                                {phase.actions.map((action, j) => (
                                  <li key={j} className="text-sm text-muted-foreground">
                                    • {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="outcomes" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Expected Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {campaign.expectedOutcomes.map((outcome, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Badge variant="secondary">{i + 1}</Badge>
                            <span className="text-sm">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}