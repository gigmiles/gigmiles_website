export default function TaxLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-10 w-48 rounded-xl bg-white/[0.04]" />
                <div className="h-3 w-72 rounded-lg bg-white/[0.03]" />
            </div>

            {/* Quarter cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <TaxSkeletonCard key={i} className="h-36" />
                ))}
            </div>

            {/* Summary card */}
            <TaxSkeletonCard className="h-28" />
        </div>
    )
}

function TaxSkeletonCard({ className }: { className?: string }) {
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
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-white/[0.05]" />
                    <div className="h-3 w-24 rounded-md bg-white/[0.05]" />
                </div>
                <div className="h-8 w-28 rounded-lg bg-white/[0.05]" />
                <div className="h-2 w-full rounded-full bg-white/[0.03]" />
            </div>
        </div>
    )
}
