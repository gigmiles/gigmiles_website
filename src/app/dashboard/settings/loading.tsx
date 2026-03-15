export default function SettingsLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-10 w-36 rounded-xl bg-white/[0.04]" />
                <div className="h-3 w-56 rounded-lg bg-white/[0.03]" />
            </div>

            {/* Option cards */}
            <div className="grid gap-3 max-w-3xl">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-white/[0.05] overflow-hidden relative h-20"
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
                        <div className="p-5 flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-white/[0.05]" />
                            <div className="space-y-2">
                                <div className="h-3 w-36 rounded-md bg-white/[0.05]" />
                                <div className="h-2 w-52 rounded-md bg-white/[0.03]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
