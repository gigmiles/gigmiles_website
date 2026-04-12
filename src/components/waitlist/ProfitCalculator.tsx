"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { calculateProfit, STATE_NAMES, type CalculatorResult } from "@/lib/gigCalculator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleOption {
  label: string;
  make: string;
  modelYear: number;
  mpg: number;
}

interface ProfitCalculatorProps {
  onJoinWaitlist: () => void;
}

// ─── Platform Data ────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "DoorDash", emoji: "🍔" },
  { name: "Uber Eats", emoji: "🛵" },
  { name: "Instacart", emoji: "🛒" },
  { name: "Amazon Flex", emoji: "📦" },
  { name: "Lyft", emoji: "🟣" },
  { name: "Uber", emoji: "⚫" },
  { name: "Grubhub", emoji: "🍟" },
  { name: "Spark", emoji: "✦" },
];

// ─── Vehicle Data ─────────────────────────────────────────────────────────────

const VEHICLE_GROUPS: { group: string; options: VehicleOption[] }[] = [
  {
    group: "Economy",
    options: [
      { label: "Toyota Camry", make: "Toyota", modelYear: 2020, mpg: 32 },
      { label: "Toyota Corolla", make: "Toyota", modelYear: 2021, mpg: 34 },
      { label: "Honda Civic", make: "Honda", modelYear: 2021, mpg: 36 },
      { label: "Honda Accord", make: "Honda", modelYear: 2020, mpg: 30 },
      { label: "Hyundai Elantra", make: "Hyundai", modelYear: 2021, mpg: 33 },
    ],
  },
  {
    group: "SUV/Truck",
    options: [
      { label: "Toyota RAV4", make: "Toyota", modelYear: 2021, mpg: 28 },
      { label: "Honda CR-V", make: "Honda", modelYear: 2021, mpg: 30 },
      { label: "Ford F-150", make: "Ford", modelYear: 2020, mpg: 20 },
      { label: "Chevrolet Silverado", make: "Chevrolet", modelYear: 2020, mpg: 18 },
      { label: "Toyota Highlander", make: "Toyota", modelYear: 2020, mpg: 24 },
    ],
  },
  {
    group: "Luxury",
    options: [
      { label: "BMW 3 Series", make: "BMW", modelYear: 2021, mpg: 26 },
      { label: "Mercedes C-Class", make: "Mercedes-Benz", modelYear: 2021, mpg: 24 },
      { label: "Tesla Model 3", make: "Tesla", modelYear: 2022, mpg: 999 },
      { label: "Audi A4", make: "Audi", modelYear: 2021, mpg: 27 },
      { label: "Lexus ES", make: "Lexus", modelYear: 2020, mpg: 28 },
    ],
  },
  {
    group: "Other",
    options: [
      { label: "Other Vehicle", make: "Other", modelYear: 2019, mpg: 25 },
    ],
  },
];

// Flatten for easy lookup
const ALL_VEHICLES: VehicleOption[] = VEHICLE_GROUPS.flatMap((g) => g.options);

// ─── State List ───────────────────────────────────────────────────────────────

const STATE_OPTIONS = Object.entries(STATE_NAMES)
  .sort(([, a], [, b]) => a.localeCompare(b))
  .map(([code, name]) => ({ code, name }));

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enterFromRight: { x: 60, opacity: 0 },
  enterFromLeft: { x: -60, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  exitToLeft: { x: -60, opacity: 0, transition: { duration: 0.3 } },
  exitToRight: { x: 60, opacity: 0, transition: { duration: 0.3 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

// ─── Animated Number ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Select Styles ────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  backgroundColor: "#0a0f1c",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: "14px",
  width: "100%",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: "36px",
  cursor: "pointer",
  outline: "none",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProfitCalculator({ onJoinWaitlist }: ProfitCalculatorProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Form state
  const [platform, setPlatform] = useState(PLATFORMS[0].name);
  const [vehicleLabel, setVehicleLabel] = useState(ALL_VEHICLES[0].label);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyGross, setDailyGross] = useState(150);

  // Results
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const selectedVehicle = ALL_VEHICLES.find((v) => v.label === vehicleLabel) ?? ALL_VEHICLES[0];
  const selectedPlatform = PLATFORMS.find((p) => p.name === platform) ?? PLATFORMS[0];

  function handleCalculate() {
    const hoursWorked = Math.min(12, Math.max(2, dailyGross / 18));
    const miles = Math.min(300, Math.max(20, dailyGross * 0.55));

    const res = calculateProfit({
      grossEarnings: dailyGross,
      miles,
      mpg: selectedVehicle.mpg,
      vehicleMake: selectedVehicle.make,
      vehicleYear: selectedVehicle.modelYear,
      state: stateCode,
      hoursWorked,
    });

    setResult(res);
    setDirection("forward");
    setStep(2);
  }

  function handleBack() {
    setDirection("back");
    setStep(1);
  }

  const enterVariant = direction === "forward" ? slideVariants.enterFromRight : slideVariants.enterFromLeft;
  const exitVariant = direction === "forward" ? slideVariants.exitToLeft : slideVariants.exitToRight;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden mx-auto max-w-md"
      style={{
        backgroundColor: "#0d1220",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Terminal chrome bar */}
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <span className="size-2.5 rounded-full bg-[#e11d48]/60" />
        <span className="size-2.5 rounded-full bg-[#f59e0b]/60" />
        <span className="size-2.5 rounded-full bg-[#10b981]/60" />
        <span className="ml-2 text-[10px] text-slate-600 font-mono tracking-wider">
          gigmiles · profit-calculator
        </span>
        {step === 2 && (
          <span className="ml-auto text-[10px] text-slate-600 font-mono">
            step 2/2
          </span>
        )}
      </div>

      {/* Step content with slide transition */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={enterVariant}
              animate={slideVariants.center}
              exit={exitVariant}
              className="p-5 space-y-4"
            >
              <p className="text-xs text-slate-500 font-mono mb-2">
                // Enter your details to see your real take-home
              </p>

              {/* Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  style={selectStyle}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.emoji} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Your Vehicle
                </label>
                <select
                  style={selectStyle}
                  value={vehicleLabel}
                  onChange={(e) => setVehicleLabel(e.target.value)}
                >
                  {VEHICLE_GROUPS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((v) => (
                        <option key={v.label} value={v.label}>
                          {v.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  State
                </label>
                <select
                  style={selectStyle}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                >
                  {STATE_OPTIONS.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Gross Slider */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Daily Gross Earnings
                </label>
                <div className="flex items-baseline justify-between mb-2">
                  <span
                    className="text-3xl font-black text-white"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    ${dailyGross}
                  </span>
                  <span className="text-xs text-slate-500">
                    ~{Math.round(Math.min(300, Math.max(20, dailyGross * 0.55)))} miles ·{" "}
                    {Math.round(Math.min(12, Math.max(2, dailyGross / 18)))}h worked
                  </span>
                </div>

                {/* Styled range input */}
                <style>{`
                  .gm-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 4px;
                    border-radius: 2px;
                    background: linear-gradient(
                      to right,
                      #10b981 0%,
                      #10b981 ${((dailyGross - 50) / 350) * 100}%,
                      rgba(255,255,255,0.08) ${((dailyGross - 50) / 350) * 100}%,
                      rgba(255,255,255,0.08) 100%
                    );
                    outline: none;
                    cursor: pointer;
                  }
                  .gm-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 10px rgba(16,185,129,0.5);
                    cursor: pointer;
                    border: 2px solid #080c14;
                  }
                  .gm-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 10px rgba(16,185,129,0.5);
                    cursor: pointer;
                    border: 2px solid #080c14;
                  }
                `}</style>

                <input
                  type="range"
                  className="gm-slider"
                  min={50}
                  max={400}
                  step={10}
                  value={dailyGross}
                  onChange={(e) => setDailyGross(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>$50</span>
                  <span>$400</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={handleCalculate}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black text-sm py-3 mt-2 transition-all duration-200"
                style={{ boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 50px rgba(16,185,129,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 30px rgba(16,185,129,0.2)";
                }}
              >
                Calculate My Real Profit →
              </Button>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="step2"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                className="p-5 space-y-4"
              >
                {/* Header */}
                <div className="text-center mb-1">
                  <p className="text-base font-semibold text-white">
                    {selectedPlatform.emoji} {selectedPlatform.name} · {selectedVehicle.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{result.stateName}</p>
                </div>

                {/* Breakdown card */}
                <div
                  className="rounded-xl overflow-hidden font-mono text-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <ResultRow
                    index={0}
                    label="Gross earnings"
                    value={`$${fmt(result.grossEarnings)}`}
                    valueColor="text-slate-200"
                  />
                  <ResultRow
                    index={1}
                    label="− Gas"
                    value={`−$${fmt(result.fuelCost)}`}
                    note={result.gallonsUsed > 0 ? `${result.gallonsUsed.toFixed(1)} gal` : "EV · no fuel"}
                    valueColor="text-slate-400"
                  />
                  <ResultRow
                    index={2}
                    label="− Vehicle wear"
                    value={`−$${fmt(result.wearCost)}`}
                    note={`$${result.depreciationRate.toFixed(2)}/mi`}
                    valueColor="text-slate-400"
                  />
                  <ResultRow
                    index={3}
                    label="− Taxes"
                    value={`−$${fmt(result.taxAmount)}`}
                    note={`SE + ${result.stateTaxRate}% state`}
                    valueColor="text-slate-400"
                  />

                  {/* Divider */}
                  <div
                    className="px-4 py-1.5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <span className="text-[10px] text-slate-700 tracking-widest select-none">
                      ══════════════════════════════
                    </span>
                  </div>

                  {/* Net profit */}
                  <motion.div
                    custom={4}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <span className="text-slate-300 font-semibold">Real net profit</span>
                    <span
                      className={`text-lg font-black ${result.netProfit >= 0 ? "text-[#10b981]" : "text-[#e11d48]"}`}
                    >
                      {result.netProfit >= 0 ? "" : "−"}${fmt(Math.abs(result.netProfit))}
                    </span>
                  </motion.div>

                  {/* Hourly rate */}
                  <ResultRow
                    index={5}
                    label="Your hourly rate"
                    value={`$${fmt(result.hourlyRate)}/hr`}
                    valueColor={result.hourlyRate >= 20 ? "text-[#10b981]" : result.hourlyRate >= result.stateMinWage ? "text-slate-200" : "text-[#f59e0b]"}
                    bold
                  />
                </div>

                {/* Min wage comparison */}
                <motion.div
                  custom={6}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{result.stateName} min wage</span>
                    <span className="text-slate-400 font-semibold">${result.stateMinWage.toFixed(2)}/hr</span>
                  </div>

                  {/* Bar */}
                  <div
                    className="relative h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    {/* Min wage marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-500/60 z-10"
                      style={{
                        left: `${Math.min(100, (result.stateMinWage / 35) * 100)}%`,
                      }}
                    />
                    {/* Hourly rate bar */}
                    <motion.div
                      className="absolute top-0 left-0 bottom-0 rounded-full"
                      style={{
                        backgroundColor:
                          result.hourlyRate < result.stateMinWage
                            ? "#f59e0b"
                            : result.hourlyRate < 20
                            ? "#10b981"
                            : "#10b981",
                      }}
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${Math.min(100, Math.max(0, (result.hourlyRate / 35) * 100))}%`,
                      }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>$0</span>
                    <span>$35/hr</span>
                  </div>
                </motion.div>

                {/* Insight message */}
                <motion.div
                  custom={7}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-xl px-4 py-3 text-sm leading-snug"
                  style={
                    result.hourlyRate < result.stateMinWage
                      ? {
                          backgroundColor: "rgba(245,158,11,0.08)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          color: "#fbbf24",
                        }
                      : result.hourlyRate < 20
                      ? {
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                        }
                      : {
                          backgroundColor: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          color: "#34d399",
                        }
                  }
                >
                  {result.hourlyRate < result.stateMinWage
                    ? `You're earning less than ${result.stateName} minimum wage. Know your real numbers.`
                    : result.hourlyRate < 20
                    ? "You're above minimum wage, but is it worth the wear on your car?"
                    : "Solid earnings! GigMiles helps you keep more at tax time."}
                </motion.div>

                {/* Upsell copy */}
                <motion.p
                  custom={8}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-slate-500 text-center leading-relaxed"
                >
                  Want the full picture? GigMiles tracks every mile, shift, and expense automatically.
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  custom={9}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3 pt-1"
                >
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="flex-1 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 font-semibold text-sm"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={onJoinWaitlist}
                    className="flex-[2] bg-[#10b981] hover:bg-[#059669] text-white font-black text-sm transition-all duration-200"
                    style={{ boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 50px rgba(16,185,129,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 30px rgba(16,185,129,0.2)";
                    }}
                  >
                    Join Waitlist →
                  </Button>
                </motion.div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Result Row Sub-component ─────────────────────────────────────────────────

interface ResultRowProps {
  index: number;
  label: string;
  value: string;
  note?: string;
  valueColor?: string;
  bold?: boolean;
}

function ResultRow({ index, label, value, note, valueColor = "text-slate-300", bold }: ResultRowProps) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="flex items-baseline justify-between gap-4 px-4 py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-slate-500 shrink-0 text-xs">{label}</span>
      <span className="flex items-baseline gap-2 min-w-0">
        <span className={`${valueColor} ${bold ? "font-bold" : ""} shrink-0 text-sm`}>
          {value}
        </span>
        {note && (
          <span className="text-slate-600 text-[10px] truncate hidden sm:inline">{note}</span>
        )}
      </span>
    </motion.div>
  );
}
