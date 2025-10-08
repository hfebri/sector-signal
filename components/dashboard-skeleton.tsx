import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950"
          >
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Getting Started Skeleton */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Brand Overview Skeleton */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <Skeleton className="h-7 w-36 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-5 w-full mb-1" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>

      {/* Documents Skeleton */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="border rounded-lg">
          <div className="p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 ml-4" />
                <Skeleton className="h-4 w-20 ml-4" />
                <div className="flex gap-2 ml-4">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
