"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrand } from "@/lib/brand-context";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const brandProfileSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters."),
  industry: z.string().min(1, "Please select an industry."),
  competitors: z.string().min(5, "Please list at least one competitor."),
  targetAudience: z
    .string()
    .min(10, "Target audience description must be at least 10 characters."),
  brandVoice: z.string().min(5, "Brand voice must be at least 5 characters."),
  brandValues: z.string().min(5, "Brand values must be at least 5 characters."),
  goals: z.string().min(10, "Goals must be at least 10 characters."),
});

type BrandProfileValues = z.infer<typeof brandProfileSchema>;

interface BrandSuggestions {
  competitors: string[];
  targetAudience: string;
  brandGuidelines: {
    voice: string;
    values: string[];
    messaging: string[];
  };
  marketInsights: {
    trends: string[];
    opportunities: string[];
    challenges: string[];
  };
}

export default function CreateBrand() {
  const { setBrands, setCurrentBrand } = useBrand();
  const router = useRouter();
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<BrandSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useForm<BrandProfileValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      brandName: "",
      industry: "",
      competitors: "",
      targetAudience: "",
      brandVoice: "",
      brandValues: "",
      goals: "",
    },
  });

  const brandName = form.watch("brandName");
  const industry = form.watch("industry");

  const getSuggestions = async () => {
    if (!brandName || !industry) {
      return;
    }

    setLoadingSuggestions(true);
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/brand-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry }),
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (field: keyof BrandProfileValues, value: string) => {
    form.setValue(field, value);
  };

  const appendCompetitor = (competitor: string) => {
    const currentValue = form.getValues("competitors");
    const existing = currentValue
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!existing.includes(competitor)) {
      existing.push(competitor);
      applySuggestion("competitors", existing.join(", "));
    }
  };

  async function onSubmit(data: BrandProfileValues) {
    setIsSubmitting(true);
    try {
      // Create brand via API
      const response = await fetch("/api/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: data.brandName,
          industry: data.industry,
          description: `${data.brandName} - ${data.industry}`,
          targetAudience: data.targetAudience,
          brandVoice: data.brandVoice,
          competitors: data.competitors.split(",").map((c) => c.trim()),
          brandValues: data.brandValues.split(",").map((v) => v.trim()),
          goals: data.goals,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create brand");
      }

      // Set as current brand
      setCurrentBrand(result.brand);

      // Reload brands list from both sources
      const brandsResponse = await fetch("/api/brands");
      const brandsData = await brandsResponse.json();
      if (brandsData.success) {
        setBrands(brandsData.brands);
      }

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("Failed to create brand. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Your Brand Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get AI-powered recommendations to build your brand strategy
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              Start with your brand name and industry, then get AI suggestions
              for the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., BMW" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automotive">
                              Automotive
                            </SelectItem>
                            <SelectItem value="technology">
                              Technology
                            </SelectItem>
                            <SelectItem value="healthcare">
                              Healthcare
                            </SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="food-beverage">
                              Food & Beverage
                            </SelectItem>
                            <SelectItem value="fashion">Fashion</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="entertainment">
                              Entertainment
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={getSuggestions}
                    disabled={!brandName || !industry || loadingSuggestions}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating AI Suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>

                {showSuggestions && suggestions && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Suggestions for {brandName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Competitors</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.competitors.map((comp, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            applySuggestion(
                              "competitors",
                              suggestions.competitors.join(", ")
                            )
                          }
                        >
                          Apply All
                        </Button>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Market Insights</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Trends:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {suggestions.marketInsights.trends.map(
                                (trend, i) => (
                                  <li key={i}>{trend}</li>
                                )
                              )}
                            </ul>
                          </div>
                          <div>
                            <strong>Opportunities:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {suggestions.marketInsights.opportunities.map(
                                (opp, i) => (
                                  <li key={i}>{opp}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={form.control}
                  name="competitors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Competitors *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Mercedes-Benz, Audi, Lexus, Tesla"
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of competitors
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your ideal customers..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      {suggestions && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            applySuggestion(
                              "targetAudience",
                              suggestions.targetAudience
                            )
                          }
                        >
                          Apply AI Suggestion
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandVoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Voice *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Professional, Premium, Innovative"
                            {...field}
                          />
                        </FormControl>
                        {suggestions && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              applySuggestion(
                                "brandVoice",
                                suggestions.brandGuidelines.voice
                              )
                            }
                          >
                            Apply AI Suggestion
                          </Button>
                        )}
                        <FormDescription>
                          Comma-separated values
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Values *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Innovation, Quality, Excellence"
                            {...field}
                          />
                        </FormControl>
                        {suggestions && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              applySuggestion(
                                "brandValues",
                                suggestions.brandGuidelines.values.join(", ")
                              )
                            }
                          >
                            Apply AI Suggestion
                          </Button>
                        )}
                        <FormDescription>
                          Comma-separated values
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Goals *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What do you want to achieve through social media?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Brand...
                      </>
                    ) : (
                      "Create Brand Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
