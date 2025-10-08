"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/lib/brand-context";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentList } from "@/components/document-list";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function Dashboard() {
  const { currentBrand, isLoading } = useBrand();
  const router = useRouter();
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!currentBrand) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Sector Signal!</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your AI-powered social media strategy platform.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Please select a brand from the brand selector in the sidebar to begin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{currentBrand.brandName} Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome to your AI-powered social media strategy platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Active Strategies
          </h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Monthly Plans
          </h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Tactical Campaigns
          </h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Competitors Tracked
          </h3>
          <p className="text-2xl font-bold">{currentBrand.competitors.length}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-800 dark:bg-green-800 dark:text-green-100">
                ✓
              </div>
              <span>Brand profile configured</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
              Edit Profile
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium dark:bg-slate-800">
                2
              </div>
              <span>Generate your annual social media strategy</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/strategy')}>
              Create Strategy
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium dark:bg-slate-800">
                3
              </div>
              <span>Create monthly content plans and campaigns</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/monthly')}>
              Plan Content
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <h2 className="text-xl font-semibold mb-4">Brand Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-50">Industry</h3>
            <p className="text-slate-600 dark:text-slate-400 capitalize">{currentBrand.industry}</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-50">Brand Voice</h3>
            <p className="text-slate-600 dark:text-slate-400">{currentBrand.brandVoice}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-medium text-slate-900 dark:text-slate-50">Description</h3>
            <p className="text-slate-600 dark:text-slate-400">{currentBrand.description}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Brand Documents</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upload social media insights and analytics reports
            </p>
          </div>
          <DocumentUpload
            brandId={currentBrand.id}
            onUploadComplete={() => setRefreshDocuments(prev => prev + 1)}
          />
        </div>
        <DocumentList brandId={currentBrand.id} refreshTrigger={refreshDocuments} />
      </div>
    </div>
  );
}
