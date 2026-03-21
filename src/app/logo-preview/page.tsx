/**
 * Logo Preview Page — /logo-preview
 * Compare all 3 logo concepts side by side.
 * DELETE this file after choosing a concept.
 */
import React from "react";
import { VibeLogo }   from "@/components/brand/VibeLogo";
import { VibeLogo_B } from "@/components/brand/VibeLogo_B";
import { VibeLogo_C } from "@/components/brand/VibeLogo_C";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-white/30">{label}</p>
      <div className="flex flex-wrap items-center gap-8">{children}</div>
    </div>
  );
}

function ConceptBlock({
  title,
  description,
  logo,
  bgClass = "bg-[#0B1120]",
}: {
  title: string;
  description: string;
  logo: React.ReactNode;
  bgClass?: string;
}) {
  return (
    <div className="flex-1 min-w-[280px] space-y-5">
      <div>
        <h2 className="font-black text-lg uppercase italic tracking-tighter text-white">{title}</h2>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>

      {/* Full logo — dark bg */}
      <div className={`${bgClass} rounded-2xl p-8 border border-white/[0.06] flex items-center justify-center`}>
        {logo}
      </div>

      {/* Sizes */}
      <div className="bg-[#0B1120] rounded-2xl p-5 border border-white/[0.06] space-y-4">
        <p className="text-[9px] text-white/25 uppercase tracking-widest">All sizes</p>
        <div className="flex flex-col gap-4">
          {(["xs", "sm", "md", "lg"] as const).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="text-[9px] w-5 text-white/20 uppercase">{s}</span>
              {React.cloneElement(logo as any, { size: s })}
            </div>
          ))}
        </div>
      </div>

      {/* Icon only */}
      <div className="bg-[#0B1120] rounded-2xl p-5 border border-white/[0.06] space-y-3">
        <p className="text-[9px] text-white/25 uppercase tracking-widest">Icon only (sidebar)</p>
        <div className="flex items-center gap-4">
          {(["xs", "sm", "md", "lg"] as const).map((s) => (
            React.cloneElement(logo as any, { size: s, iconOnly: true, key: s })
          ))}
        </div>
      </div>

      {/* Light bg */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.06] space-y-2">
        <p className="text-[9px] text-black/30 uppercase tracking-widest">Light background</p>
        {React.cloneElement(logo as any, { light: true })}
      </div>
    </div>
  );
}

export default function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-[#060B10] p-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-16">

        <header className="space-y-2">
          <h1 className="font-black text-4xl uppercase italic tracking-tighter text-white">
            Logo <span className="text-[#10B981]">Preview</span>
          </h1>
          <p className="text-white/40 text-sm">
            Compare 3 concepts — choose one, set it as <code className="text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">VibeLogo.tsx</code> and delete the others.
          </p>
        </header>

        {/* Side-by-side at same size */}
        <Section label="Side-by-side comparison — md size">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConceptBlock
              title="A — Road Perspective"
              description="3 bars vanishing to a point + upward chevron. Instantly reads as road + growth."
              logo={<VibeLogo />}
            />
            <ConceptBlock
              title="B — Speed Ring"
              description="270° speedometer arc with gradient. Premium, minimal, Apple-style."
              logo={<VibeLogo_B />}
            />
            <ConceptBlock
              title="C — Route Pin"
              description="Map location pin + lime speed lines. Strong brand narrative: 'You drive, we track.'"
              logo={<VibeLogo_C />}
            />
          </div>
        </Section>

        <footer className="text-white/20 text-xs pt-8 border-t border-white/[0.06]">
          After choosing: copy chosen file → VibeLogo.tsx · delete VibeLogo_B.tsx, VibeLogo_C.tsx, and this page.
        </footer>
      </div>
    </div>
  );
}
