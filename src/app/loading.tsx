import { DashboardSkeleton } from "@/components/weather/DashboardSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[76rem] px-4 pb-10 pt-5 sm:px-6">
      <DashboardSkeleton />
    </main>
  );
}
