"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import * as z from "zod";
import { useBrand } from "@/lib/brand-context";
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

const brandProfileSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters."),
  industry: z.string().min(1, "Please select an industry."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  targetAudience: z
    .string()
    .min(10, "Target audience description must be at least 10 characters."),
  brandVoice: z.string().min(5, "Brand voice must be at least 5 characters."),
  competitors: z.string().min(5, "Please list at least one competitor."),
  goals: z.string().min(10, "Goals must be at least 10 characters."),
});

type BrandProfileValues = z.infer<typeof brandProfileSchema>;

export default function Settings() {
  const { currentBrand } = useBrand();

  const form = useForm<BrandProfileValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      brandName: "",
      industry: "",
      description: "",
      targetAudience: "",
      brandVoice: "",
      competitors: "",
      goals: "",
    },
  });

  // Pre-fill form with current brand data
  useEffect(() => {
    if (currentBrand) {
      form.reset({
        brandName: currentBrand.brandName,
        industry: currentBrand.industry,
        description: currentBrand.description,
        targetAudience: currentBrand.targetAudience,
        brandVoice: currentBrand.brandVoice,
        competitors: currentBrand.competitors.join("\n"),
        goals: currentBrand.goals,
      });
    }
  }, [currentBrand, form]);

  async function onSubmit(data: BrandProfileValues) {
    try {
      const response = await fetch("/api/brand-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // TODO: Show success message and redirect or update UI
        console.log("Brand profile saved successfully:", result.data);
      } else {
        console.error("Failed to save brand profile:", result.error);
      }
    } catch (error) {
      console.error("Error saving brand profile:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentBrand
            ? `Edit ${currentBrand.brandName} Profile`
            : "Brand Profile Setup"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure your brand profile to get personalized AI recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>
            Tell us about your brand to create tailored social media strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your brand name" {...field} />
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
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your brand does and stands for..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This helps our AI understand your brand's core values and
                      mission.
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
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your ideal customers (demographics, interests, behaviors)..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about age, interests, pain points, and social
                      media habits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandVoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Voice & Tone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Professional, Friendly, Humorous, Authoritative..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      How should your brand sound when communicating with your
                      audience?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Competitors</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your main competitors (one per line or comma-separated)..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll analyze their social media strategies to help inform
                      your approach.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What do you want to achieve through social media? (brand awareness, lead generation, customer engagement, etc.)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Clear goals help us create targeted strategies and measure
                      success.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Save Brand Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
