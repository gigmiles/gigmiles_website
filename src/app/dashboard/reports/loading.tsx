export default function ReportsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-10 w-40 rounded-xl bg-white/[0.04]" />
                <div className="h-3 w-64 rounded-lg bg-white/[0.03]" />
            </div>

            {/* Controls / filters */}
            <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-9 w-28 rounded-xl bg-white/[0.04]" />
                ))}
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <ReportSkeletonCard key={i} className="h-24" />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportSkeletonCard className="h-64" />
                <ReportSkeletonCard className="h-64" />
            </div>

            {/* Activity calendar */}
            <ReportSkeletonCard className="h-40" />
        </div>
    )
}

function ReportSkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={`rounded-2xl border border-white/[0.05] overflow-hidden relative ${className}`}
            style={{ background: 'rgba(13, 18, 32, 0.8)' }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s ease-in-out infinite',
                }}
            />
            <div className="p-5 space-y-3">
                <div className="h-2 w-20 rounded-md bg-white/[0.04]" />
                <div className="h-7 w-32 rounded-lg bg-white/[0.05]" />
                <div className="h-2 w-16 rounded-md bg-white/[0.03]" />
            </div>
        </div>
    )
}
