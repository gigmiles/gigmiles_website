import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm animate-pulse border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-24 rounded mb-2" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      
      <div className="flex justify-between pt-4 border-t border-border">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-3xl animate-pulse">
      <Skeleton className="h-4 w-32 bg-white/20 rounded mb-4" />
      <Skeleton className="h-16 w-40 bg-white/20 rounded mb-2" />
      <Skeleton className="h-5 w-28 bg-white/20 rounded" />
    </div>
  );
}
