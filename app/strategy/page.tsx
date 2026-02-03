"use client";

import { useState, useEffect, useRef } from "react";
import { useBrand } from "@/lib/brand-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles, Target, TrendingUp, Users, FileText, BarChart3, Send, Database } from "lucide-react";
import { DataQuality, Citation } from "@/lib/ai/types/citations";
import { DataQualityBadge } from "@/components/citations/DataQualityBadge";
import { SourcePanel } from "@/components/citations/SourcePanel";
import { CitationText } from "@/components/citations/CitationLink";

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
  const [strategyMetadata, setStrategyMetadata] = useState<{
    strategyId?: string;
    period?: { start: string; end: string; label: string };
    generatedWithRag?: boolean;
    documentCount?: number;
  } | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("positioning");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [highlightedCitation, setHighlightedCitation] = useState<number | undefined>(undefined);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  // Load existing strategy on mount
  useEffect(() => {
    const loadExistingStrategy = async () => {
      if (!currentBrand) return;

      setInitialLoading(true);
      try {
        const response = await fetch(`/api/strategy/latest?brandId=${currentBrand.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.strategy) {
            setStrategy(data.strategy.strategyData);
            setStrategyMetadata({
              strategyId: data.strategy.id,
              period: {
                start: data.strategy.startDate,
                end: data.strategy.endDate,
                label: `${new Date(data.strategy.startDate).getFullYear()} - ${new Date(data.strategy.endDate).getFullYear()}`,
              },
              generatedWithRag: data.strategy.generatedWithRag === 1,
              documentCount: data.strategy.documentCount,
            });

            // Load citations and data quality if the strategy was generated with RAG
            if (data.strategy.generatedWithRag === 1) {
              try {
                const citationsResponse = await fetch(`/api/strategy/citations?brandId=${currentBrand.id}`);
                if (citationsResponse.ok) {
                  const citationsData = await citationsResponse.json();
                  if (citationsData.citations) {
                    // Ensure all citations have citationNumber set (in case loaded from old cache)
                    const citationsWithNumbers = citationsData.citations.map((citation: any, index: number) => ({
                      ...citation,
                      citationNumber: citation.citationNumber ?? index + 1,
                    }));
                    setCitations(citationsWithNumbers);
                  }
                  if (citationsData.dataQuality) {
                    setDataQuality(citationsData.dataQuality);
                  }
                }
              } catch (error) {
                console.error("Failed to load citations:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load existing strategy:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingStrategy();
  }, [currentBrand]);

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
      setStrategyMetadata({
        strategyId: data.strategyId,
        period: data.period,
        generatedWithRag: data.generatedWithRag === 1,
        documentCount: data.documentCount,
      });

      // Set citations and data quality if available
      if (data.citations) {
        const citationsArray = data.citations.overall || [];
        // Ensure all citations have citationNumber set
        const citationsWithNumbers = citationsArray.map((citation: any, index: number) => ({
          ...citation,
          citationNumber: citation.citationNumber ?? index + 1,
        }));
        setCitations(citationsWithNumbers);
      }
      if (data.dataQuality) {
        setDataQuality(data.dataQuality);
      }

      // Save strategy to localStorage for use in monthly planning
      if (currentBrand) {
        localStorage.setItem(
          `strategy-${currentBrand.id}`,
          JSON.stringify(data.strategy)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpPrompt.trim() || !strategy) return;

    setIsModifying(true);
    setError(null);

    try {
      // Call API to modify only the current tab
      const response = await fetch("/api/strategy/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: currentBrand?.id,
          currentStrategy: strategy,
          tab: currentTab,
          modification: followUpPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to modify strategy");
      }

      const data = await response.json();

      // Update only the modified section
      setStrategy(data.strategy);
      setFollowUpPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modification failed");
    } finally {
      setIsModifying(false);
    }
  };

  // Handle citation click - expand sources if needed, then scroll and highlight
  const handleCitationClick = (citationNumber: number) => {
    setHighlightedCitation(citationNumber);

    // If sources section is not expanded, expand it first
    if (!sourcesExpanded) {
      setSourcesExpanded(true);
      // Wait for expansion animation to complete before scrolling
      setTimeout(() => {
        scrollToCitation(citationNumber);
      }, 300); // Give time for the panel to expand
    } else {
      // Already expanded, scroll immediately
      scrollToCitation(citationNumber);
    }

    // Clear existing timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Clear highlight after 3 seconds
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCitation(undefined);
    }, 3000);
  };

  // Scroll to a specific citation
  const scrollToCitation = (citationNumber: number) => {
    const element = document.getElementById(`citation-${citationNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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

  // Show skeleton while loading initial strategy
  if (initialLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show generation card if no strategy exists
  if (!strategy) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentBrand.brandName}
          </h1>
        </div>
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
    <div className="relative p-8 space-y-6">
      {/* Loading Overlay - Disables entire page during regeneration */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Generating Strategy</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This may take 2-3 minutes. Please do not close this page or navigate away.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Annual Strategy</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-muted-foreground">{currentBrand.brandName}</span>
            {strategyMetadata?.period && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{strategyMetadata.period.label}</span>
              </>
            )}
            {dataQuality && (
              <>
                <span className="text-muted-foreground">•</span>
                <DataQualityBadge dataQuality={dataQuality} variant="detailed" />
              </>
            )}
          </div>
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

      {/* Follow-up Prompt Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleFollowUpModification} className="flex gap-2">
            <Input
              placeholder={`Modify ${currentTab}... (e.g., "Add more focus on sustainability" or "Make it more aggressive")`}
              value={followUpPrompt}
              onChange={(e) => setFollowUpPrompt(e.target.value)}
              disabled={isModifying}
            />
            <Button type="submit" disabled={isModifying || !followUpPrompt.trim()}>
              {isModifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
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
                <p className="text-muted-foreground">
                  <CitationText onCitationClick={handleCitationClick}>
                    {strategy.brandPositioning?.statement || "No positioning statement available"}
                  </CitationText>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Differentiators</h3>
                <ul className="space-y-2">
                  {(strategy.brandPositioning?.differentiators || []).map((diff, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="secondary">{i + 1}</Badge>
                      <span className="text-sm">
                        <CitationText onCitationClick={handleCitationClick}>
                          {diff}
                        </CitationText>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Target Audience Insights</h3>
                <ul className="space-y-2">
                  {(strategy.brandPositioning?.targetAudienceInsights || []).map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm">
                        <CitationText onCitationClick={handleCitationClick}>
                          {insight}
                        </CitationText>
                      </span>
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
                  {(strategy.swotAnalysis?.strengths || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.swotAnalysis?.weaknesses || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.swotAnalysis?.opportunities || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.swotAnalysis?.threats || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pillars" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {(strategy.contentPillars || []).map((pillar, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <CitationText onCitationClick={handleCitationClick}>{pillar.name}</CitationText>
                  </CardTitle>
                  <CardDescription>
                    <CitationText onCitationClick={handleCitationClick}>{pillar.description}</CitationText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Objectives</h4>
                    <ul className="space-y-1">
                      {(pillar.objectives || []).map((obj, j) => (
                        <li key={j} className="text-sm text-muted-foreground">
                          • <CitationText onCitationClick={handleCitationClick}>{obj}</CitationText>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(pillar.contentTypes || []).map((type, j) => (
                      <Badge key={j} variant="outline">{type}</Badge>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Frequency:</span> <CitationText onCitationClick={handleCitationClick}>{pillar.frequency || "N/A"}</CitationText>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {(strategy.annualGoals || []).map((goal, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <CitationText onCitationClick={handleCitationClick}>{goal.goal}</CitationText>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Metric:</span>
                    <span className="text-sm font-semibold">
                      <CitationText onCitationClick={handleCitationClick}>{goal.metric}</CitationText>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <Badge>
                      <CitationText onCitationClick={handleCitationClick}>{goal.target}</CitationText>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeline:</span>
                    <span className="text-sm">
                      <CitationText onCitationClick={handleCitationClick}>{goal.timeline}</CitationText>
                    </span>
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
                  {(strategy.contentPlaybook?.toneAndVoice || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.contentPlaybook?.messagingFramework || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.contentPlaybook?.visualGuidelines || []).map((item, i) => (
                    <li key={i} className="text-sm">
                      • <CitationText onCitationClick={handleCitationClick}>{item}</CitationText>
                    </li>
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
                  {(strategy.contentPlaybook?.contentFormats || []).map((format, i) => (
                    <Badge key={i} variant="secondary">{format}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {(strategy.kpiFramework || []).map((kpi, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <CitationText onCitationClick={handleCitationClick}>{kpi.category || "Uncategorized"}</CitationText>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Metrics to Track</h4>
                    <div className="flex flex-wrap gap-2">
                      {(kpi.metrics || []).map((metric, j) => (
                        <Badge key={j} variant="outline">{metric}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Industry Benchmarks</h4>
                    <p className="text-sm text-muted-foreground">
                      <CitationText onCitationClick={handleCitationClick}>{kpi.benchmarks || "No benchmarks available"}</CitationText>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Citation Sources Panel */}
      {citations.length > 0 && (
        <SourcePanel
          citations={citations}
          isExpanded={sourcesExpanded}
          onExpandedChange={setSourcesExpanded}
          highlightedCitationNumber={highlightedCitation}
        />
      )}
    </div>
  );
}