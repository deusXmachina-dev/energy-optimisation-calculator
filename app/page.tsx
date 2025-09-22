"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// removed obsolete type

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const mwhFmt = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

export default function Home() {

  const [energyCostText, setEnergyCostText] = useState("0.18");
  const [averageConsumptionText, setAverageConsumptionText] = useState("6.5");
  const [robotsText, setRobotsText] = useState("2000");
  const [hoursText, setHoursText] = useState("4000");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate from query params on mount
  useEffect(() => {
    const ec = searchParams.get("ec");
    const avg = searchParams.get("avg");
    const r = searchParams.get("r");
    const h = searchParams.get("h");
    if (ec !== null) setEnergyCostText(ec);
    if (avg !== null) setAverageConsumptionText(avg);
    if (r !== null) setRobotsText(r);
    if (h !== null) setHoursText(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to query params without navigation
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => {
      const v = value.trim();
      if (v) nextParams.set(key, v);
      else nextParams.delete(key);
    };
    setOrDelete("ec", energyCostText);
    setOrDelete("avg", averageConsumptionText);
    setOrDelete("r", robotsText);
    setOrDelete("h", hoursText);

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current === next) return;

    const url = next ? `${pathname}?${next}` : pathname;
    router.replace(url, { scroll: false });
  }, [energyCostText, averageConsumptionText, robotsText, hoursText, pathname, router, searchParams]);

  

  const results = useMemo(() => {
    const parsedEnergyCost = parseFloat(energyCostText.replace(/,/g, "."));
    const parsedAvgConsumption = parseFloat(averageConsumptionText.replace(/,/g, "."));
    const parsedRobots = parseFloat(robotsText.replace(/,/g, "."));
    const parsedHours = parseFloat(hoursText.replace(/,/g, "."));

    const energyCostPerKwh = isNaN(parsedEnergyCost) ? 0 : parsedEnergyCost;
    const averageConsumptionKw = isNaN(parsedAvgConsumption) ? 0 : parsedAvgConsumption;
    const numberOfRobots = isNaN(parsedRobots) ? 0 : parsedRobots;
    const operatingHoursPerYear = isNaN(parsedHours) ? 0 : parsedHours;

    const baselineKwhPerYear =
      numberOfRobots *
      averageConsumptionKw *
      operatingHoursPerYear;

    const baselineCost = baselineKwhPerYear * energyCostPerKwh;
    const baselineMwhPerYear = baselineKwhPerYear / 1000;

    const improvements = [5, 10, 15, 20, 25, 30];
    const scenarios = improvements.map((pct) => {
      const factor = Math.max(0, 1 - pct / 100);
      const newKwhPerYear = baselineKwhPerYear * factor;
      const newCost = baselineCost * factor;
      const annualSavings = baselineCost - newCost;
      const savingsPercent = baselineCost > 0 ? (annualSavings / baselineCost) * 100 : 0;
      return {
        pct,
        newKwhPerYear,
        newMwhPerYear: newKwhPerYear / 1000,
        newCost,
        annualSavings,
        savingsPercent,
        highlight: pct === 15,
        assumed: pct === 15,
      };
    });

    return {
      baselineKwhPerYear,
      baselineMwhPerYear,
      baselineCost,
      scenarios,
    };
  }, [energyCostText, averageConsumptionText, robotsText, hoursText]);

  return (
    <div className="min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Energy Savings Calculator</h1>
          <p className="text-sm md:text-base text-black/60 dark:text-white/60 mt-1">
            Estimate annual energy and cost savings for robot cells in automotive production.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 md:p-6 bg-white/50 dark:bg-black/30 backdrop-blur">
              <h2 className="text-base font-medium mb-4">Inputs</h2>

              <div className="space-y-4">
                <Field
                  label="Energy cost (€/kWh)"
                  value={energyCostText}
                  min={0}
                  step="0.01"
                  type="text"
                  onChange={setEnergyCostText}
                />
                <Field
                  label="Number of robots"
                  value={robotsText}
                  min={0}
                  step="1"
                  type="text"
                  onChange={setRobotsText}
                />
                <Field
                  label="Average consumption per robot (kW)"
                  value={averageConsumptionText}
                  min={0}
                  step="0.1"
                  type="text"
                  onChange={setAverageConsumptionText}
                />
                <Field
                  label="Operating hours per year"
                  value={hoursText}
                  min={0}
                  step="1"
                  type="text"
                  onChange={setHoursText}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 md:p-6 bg-white/50 dark:bg-black/30 backdrop-blur">
              <h2 className="text-base font-medium mb-4">Results</h2>
              <div className="overflow-x-auto">
                <div className="mb-4">
                  <table className="w-full text-sm md:text-base">
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                      <Row label="Baseline energy (MWh/year)" value={mwhFmt.format(results.baselineMwhPerYear)} />
                      <Row label="Baseline cost (€/year)" value={currency.format(results.baselineCost)} />
                    </tbody>
                  </table>
                </div>
                <div className="mb-3 rounded-md border border-black/10 dark:border-white/15 bg-black/[.03] dark:bg-white/[.04] px-3 py-2 text-xs text-black/70 dark:text-white/70">
                  We assume an average improvement of <span className="font-semibold">15%</span> based on typical deployments.
                </div>
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="text-left text-black/60 dark:text-white/60">
                      <th className="py-2 pr-4 font-normal">Average improvement</th>
                      <th className="py-2 pr-4 font-normal">Energy (MWh/yr)</th>
                      <th className="py-2 text-right font-normal">Savings (€/yr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/10">
                    {results.scenarios.map((s) => (
                      <ScenarioRow
                        key={s.pct}
                        improvement={`${s.pct}%`}
                        energy={mwhFmt.format(s.newMwhPerYear)}
                        savings={currency.format(s.annualSavings)}
                        highlight={s.highlight}
                        assumed={s.assumed}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-xs text-black/50 dark:text-white/50">
          Disclaimer: This is an estimate. Actual savings depend on duty cycles and load.
      </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
  min,
  max,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: number;
  max?: number;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-black/60 dark:text-white/60 mb-1">{label}</span>
      <input
        type={type}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
      />
    </label>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <tr>
      <td className="py-3 pr-4 align-top text-black/70 dark:text-white/70">{label}</td>
      <td className={`py-3 text-right font-medium ${emphasis ? "text-green-700 dark:text-green-400" : ""}`}>{value}</td>
    </tr>
  );
}

function ScenarioRow({
  improvement,
  energy,
  savings,
  highlight,
  assumed,
}: {
  improvement: string;
  energy: string;
  savings: string;
  highlight?: boolean;
  assumed?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-black/[.035] dark:bg-white/[.06]" : ""}>
      <td className={`py-3 pr-4 ${highlight ? "font-medium" : ""}`}>
        <span>{improvement}</span>
        {assumed ? (
          <span className="ml-2 inline-flex items-center rounded-sm border border-black/15 dark:border-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-black/70 dark:text-white/70">Assumed</span>
        ) : null}
      </td>
      <td className="py-3 pr-4">{energy}</td>
      <td className={`py-3 text-right font-semibold ${highlight ? "text-green-700 dark:text-green-400" : ""}`}>{savings}</td>
    </tr>
  );
}
