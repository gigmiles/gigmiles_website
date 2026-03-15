export default function DashboardLoading() {
    return (
        <div className="space-y-6 pb-12 animate-pulse">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="h-10 w-64 rounded-xl bg-white/[0.04]" />
                    <div className="h-3 w-80 rounded-lg bg-white/[0.03]" />
                </div>
                <div className="h-10 w-48 rounded-xl bg-white/[0.04]" />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-9 w-28 rounded-xl bg-white/[0.04]" />
                ))}
            </div>

            {/* Daily Motivation */}
            <div className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />

            {/* Today Summary Hero */}
            <SkeletonCard className="h-44" />

            {/* Two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="flex flex-col gap-4">
                    <SkeletonCard className="h-52" />
                    <SkeletonCard className="h-40" />
                </div>
                {/* Right column */}
                <div className="flex flex-col gap-4">
                    <SkeletonCard className="h-36" />
                    <SkeletonCard className="h-48" />
                    <SkeletonCard className="h-36" />
                </div>
            </div>

            {/* Earnings chart */}
            <SkeletonCard className="h-64 mt-8" />
        </div>
    )
}

function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={`rounded-2xl border border-white/[0.05] overflow-hidden relative ${className}`}
            style={{ background: 'rgba(13, 18, 32, 0.8)' }}
        >
            {/* Shimmer sweep */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s ease-in-out infinite',
                }}
            />
            {/* Inner content skeleton lines */}
            <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-white/[0.05]" />
                    <div className="space-y-1.5">
                        <div className="h-3 w-28 rounded-md bg-white/[0.05]" />
                        <div className="h-2 w-16 rounded-md bg-white/[0.03]" />
                    </div>
                </div>
                <div className="h-8 w-36 rounded-lg bg-white/[0.05] mt-2" />
                <div className="h-2 w-full rounded-md bg-white/[0.03]" />
                <div className="h-2 w-3/4 rounded-md bg-white/[0.03]" />
            </div>
        </div>
    )
}
