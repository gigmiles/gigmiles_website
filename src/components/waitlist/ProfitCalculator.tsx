"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  { name: "DoorDash" },
  { name: "Uber Eats" },
  { name: "Instacart" },
  { name: "Amazon Flex" },
  { name: "Lyft" },
  { name: "Uber" },
  { name: "Grubhub" },
  { name: "Spark" },
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
  backgroundColor: "#050B12",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0px",
  color: "#E2E8F0",
  padding: "11px 14px",
  fontSize: "13px",
  width: "100%",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2314B8A6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: "36px",
  cursor: "pointer",
  outline: "none",
  fontFamily: "var(--font-space-grotesk)",
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
    <motion.div className="overflow-hidden mx-auto max-w-md border border-white/[0.07] bg-[#08111F]">
      {/* Header bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06] bg-[#050B12]">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#14B8A6]/80 font-[family-name:var(--font-space-grotesk)] font-medium flex items-center gap-2">
          <span className="w-1 h-1 bg-[#14B8A6] rounded-full" />
          Profit Calculator
        </span>
        <span className="text-[10px] text-white/30 font-[family-name:var(--font-space-grotesk)] tabular-nums tracking-wider">
          {step}/2
        </span>
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
              className="p-5 sm:p-6 space-y-5"
            >
              <p className="text-[12px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)] mb-2 leading-relaxed">
                Enter your details to see your real take-home.
              </p>

              {/* Platform */}
              <div>
                <label htmlFor="calc-platform" className="block text-[10px] font-medium text-white/55 mb-2 uppercase tracking-[0.15em] font-[family-name:var(--font-space-grotesk)]">
                  Platform
                </label>
                <select
                  id="calc-platform"
                  style={selectStyle}
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label htmlFor="calc-vehicle" className="block text-[10px] font-medium text-white/55 mb-2 uppercase tracking-[0.15em] font-[family-name:var(--font-space-grotesk)]">
                  Your Vehicle
                </label>
                <select
                  id="calc-vehicle"
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
                <label htmlFor="calc-state" className="block text-[10px] font-medium text-white/55 mb-2 uppercase tracking-[0.15em] font-[family-name:var(--font-space-grotesk)]">
                  State
                </label>
                <select
                  id="calc-state"
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
                <label htmlFor="calc-gross" className="block text-[10px] font-medium text-white/55 mb-2 uppercase tracking-[0.15em] font-[family-name:var(--font-space-grotesk)]">
                  Daily Gross Earnings
                </label>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-3xl font-bold text-white tabular-nums tracking-[-0.03em] font-[family-name:var(--font-space-grotesk)]">
                    ${dailyGross}
                  </span>
                  <span className="text-[11px] text-white/45 font-[family-name:var(--font-dm-sans)]">
                    ~{Math.round(Math.min(300, Math.max(20, dailyGross * 0.55)))} mi ·{" "}
                    {Math.round(Math.min(12, Math.max(2, dailyGross / 18)))}h
                  </span>
                </div>

                <style>{`
                  .gm-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(
                      to right,
                      #14B8A6 0%,
                      #14B8A6 ${((dailyGross - 50) / 350) * 100}%,
                      rgba(255,255,255,0.08) ${((dailyGross - 50) / 350) * 100}%,
                      rgba(255,255,255,0.08) 100%
                    );
                    outline: none;
                    cursor: pointer;
                  }
                  .gm-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #14B8A6;
                    box-shadow: 0 0 12px rgba(20,184,166,0.55);
                    cursor: pointer;
                    border: 2px solid #050B12;
                  }
                  .gm-slider::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #14B8A6;
                    box-shadow: 0 0 12px rgba(20,184,166,0.55);
                    cursor: pointer;
                    border: 2px solid #050B12;
                  }
                `}</style>

                <input
                  id="calc-gross"
                  type="range"
                  className="gm-slider"
                  min={50}
                  max={400}
                  step={10}
                  value={dailyGross}
                  onChange={(e) => setDailyGross(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-white/25 mt-2 font-[family-name:var(--font-dm-sans)] tabular-nums">
                  <span>$50</span>
                  <span>$400</span>
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleCalculate}
                className="w-full bg-[#14B8A6] text-[#050B12] text-[12px] tracking-[0.08em] font-[family-name:var(--font-space-grotesk)] font-semibold py-3 mt-2 transition-all duration-200 hover:bg-[#14B8A6]/85 active:scale-[0.98]"
              >
                Calculate Real Profit
              </button>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="step2"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                className="p-5 sm:p-6 space-y-5"
              >
                {/* Header */}
                <div className="pb-4 border-b border-white/[0.06]">
                  <p className="text-[14px] font-medium text-white font-[family-name:var(--font-space-grotesk)]">
                    {selectedPlatform.name} <span className="text-white/30">·</span> {selectedVehicle.label}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5 font-[family-name:var(--font-dm-sans)]">{result.stateName}</p>
                </div>

                {/* Breakdown table */}
                <div className="border border-white/[0.07] divide-y divide-white/[0.06]">
                  <ResultRow
                    index={0}
                    label="Gross earnings"
                    value={`$${fmt(result.grossEarnings)}`}
                    valueColor="text-white/85"
                  />
                  <ResultRow
                    index={1}
                    label="Gas"
                    value={`−$${fmt(result.fuelCost)}`}
                    note={result.gallonsUsed > 0 ? `${result.gallonsUsed.toFixed(1)} gal` : "EV · no fuel"}
                    valueColor="text-[#F87171]/85"
                  />
                  <ResultRow
                    index={2}
                    label="Vehicle wear"
                    value={`−$${fmt(result.wearCost)}`}
                    note={`$${result.depreciationRate.toFixed(2)}/mi`}
                    valueColor="text-[#F87171]/85"
                  />
                  <ResultRow
                    index={3}
                    label="Taxes"
                    value={`−$${fmt(result.taxAmount)}`}
                    note={`SE + ${result.stateTaxRate}% state`}
                    valueColor="text-[#FBBF24]/85"
                  />

                  {/* Net profit */}
                  <motion.div
                    custom={4}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-between px-4 py-4 bg-[#14B8A6]/[0.04]"
                  >
                    <span className="text-[#14B8A6] text-[10px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">
                      Real net profit
                    </span>
                    <span
                      className={`text-[22px] font-bold tracking-[-0.03em] tabular-nums font-[family-name:var(--font-space-grotesk)] ${
                        result.netProfit >= 0 ? "text-[#10B981]" : "text-[#F87171]"
                      }`}
                    >
                      {result.netProfit >= 0 ? "" : "−"}${fmt(Math.abs(result.netProfit))}
                    </span>
                  </motion.div>

                  {/* Hourly rate */}
                  <ResultRow
                    index={5}
                    label="Your hourly rate"
                    value={`$${fmt(result.hourlyRate)}/hr`}
                    valueColor={
                      result.hourlyRate >= 20
                        ? "text-[#10B981]"
                        : result.hourlyRate >= result.stateMinWage
                        ? "text-white/80"
                        : "text-[#FBBF24]"
                    }
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
                  <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-dm-sans)]">
                    <span className="text-white/40">{result.stateName} min wage</span>
                    <span className="text-white/65 font-semibold tabular-nums font-[family-name:var(--font-space-grotesk)]">
                      ${result.stateMinWage.toFixed(2)}/hr
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="relative h-1 bg-white/[0.06] overflow-hidden">
                    {/* Min wage marker */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/40 z-10"
                      style={{
                        left: `${Math.min(100, (result.stateMinWage / 35) * 100)}%`,
                      }}
                    />
                    {/* Hourly rate bar */}
                    <motion.div
                      className="absolute top-0 left-0 bottom-0"
                      style={{
                        backgroundColor:
                          result.hourlyRate < result.stateMinWage
                            ? "#FBBF24"
                            : result.hourlyRate < 20
                            ? "#14B8A6"
                            : "#10B981",
                      }}
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${Math.min(100, Math.max(0, (result.hourlyRate / 35) * 100))}%`,
                      }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-white/25 font-[family-name:var(--font-dm-sans)] tabular-nums">
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
                  className={`px-4 py-3 text-[12px] leading-relaxed font-[family-name:var(--font-dm-sans)] border ${
                    result.hourlyRate < result.stateMinWage
                      ? "border-[#FBBF24]/25 bg-[#FBBF24]/[0.05] text-[#FBBF24]/90"
                      : result.hourlyRate < 20
                      ? "border-white/[0.08] bg-white/[0.02] text-[#94A3B8]"
                      : "border-[#14B8A6]/25 bg-[#14B8A6]/[0.05] text-[#14B8A6]/90"
                  }`}
                >
                  {result.hourlyRate < result.stateMinWage
                    ? `You're earning less than ${result.stateName} minimum wage. Know your real numbers.`
                    : result.hourlyRate < 20
                    ? "You're above minimum wage, but is it worth the wear on your car?"
                    : "Solid earnings. GigMiles helps you keep more at tax time."}
                </motion.div>

                {/* Upsell copy */}
                <motion.p
                  custom={8}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-[11px] text-white/35 leading-relaxed font-[family-name:var(--font-dm-sans)]"
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
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border border-white/[0.14] text-white/55 text-[11px] tracking-[0.08em] font-[family-name:var(--font-space-grotesk)] py-3 transition-all duration-200 hover:border-white/30 hover:text-white/80 active:scale-[0.98]"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={onJoinWaitlist}
                    className="flex-[2] bg-[#14B8A6] text-[#050B12] text-[12px] tracking-[0.08em] font-[family-name:var(--font-space-grotesk)] font-semibold py-3 transition-all duration-200 hover:bg-[#14B8A6]/85 active:scale-[0.98]"
                  >
                    Join Waitlist
                  </button>
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

function ResultRow({ index, label, value, note, valueColor = "text-white/75", bold }: ResultRowProps) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="flex items-baseline justify-between gap-3 px-4 py-3"
    >
      <span className="text-white/45 shrink-0 text-[12px] font-[family-name:var(--font-dm-sans)]">{label}</span>
      <span className="flex items-baseline gap-2 min-w-0 font-[family-name:var(--font-space-grotesk)]">
        <span className={`${valueColor} ${bold ? "font-semibold" : "font-medium"} shrink-0 text-[13px] tabular-nums`}>
          {value}
        </span>
        {note && (
          <span className="text-white/25 text-[10px] truncate hidden sm:inline font-[family-name:var(--font-dm-sans)]">{note}</span>
        )}
      </span>
    </motion.div>
  );
}
