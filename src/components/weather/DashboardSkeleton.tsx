import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Full-dashboard loading skeleton that mirrors the final grid layout. */
export function DashboardSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12"
      role="status"
    >
      <span className="sr-only">Loading weather data…</span>

      {/* Hero */}
      <Card className="lg:col-span-2 xl:order-1 xl:col-span-8">
        <div className="p-5 sm:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-3.5 w-28" />
          <div className="mt-2 flex items-center justify-center gap-7 py-1">
            <Skeleton className="h-[84px] w-48 rounded-2xl" />
            <Skeleton className="h-[78px] w-[110px] rounded-xl" />
          </div>
          <Skeleton className="mx-auto mt-2 h-3.5 w-48" />
          <div className="mt-4 border-t border-line pt-4">
            <Skeleton className="h-5 w-full max-w-md" />
          </div>
        </div>
      </Card>

      {/* Hourly */}
      <div className="lg:order-2 lg:col-span-2 xl:order-5 xl:col-span-12">
        <Card className="overflow-hidden">
          <div className="px-5 pb-3 pt-5 sm:px-6">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-1 overflow-hidden px-3 pb-4 sm:px-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] min-w-[72px] rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>

      {/* Details */}
      <div className="lg:order-3 xl:order-3 xl:col-span-8">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Daily */}
      <Card className="lg:order-4 xl:order-2 xl:col-span-4">
        <div className="p-5 sm:p-6">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Skeleton className="h-[280px] rounded-[22px] lg:order-5 lg:col-span-2 xl:order-4 xl:col-span-4" />
    </div>
  );
}
