"use client";

import { useMemo, useState } from "react";

type CalculatorInputs = {
  energyCostPerKwh: number;
  numberOfRobots: number;
  averageConsumptionKw: number;
  operatingHoursPerDay: number;
  operatingDaysPerYear: number;
  efficiencyImprovementPercent: number;
};

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    energyCostPerKwh: 0.18,
    numberOfRobots: 20,
    averageConsumptionKw: 3.5,
    operatingHoursPerDay: 16,
    operatingDaysPerYear: 250,
    efficiencyImprovementPercent: 15,
  });

  const update = (key: keyof CalculatorInputs) =>
    (value: string) => {
      const parsed = Number(value);
      setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
    };

  const results = useMemo(() => {
    const baselineKwhPerYear =
      inputs.numberOfRobots *
      inputs.averageConsumptionKw *
      inputs.operatingHoursPerDay *
      inputs.operatingDaysPerYear;

    const baselineCost = baselineKwhPerYear * inputs.energyCostPerKwh;

    const factor = Math.max(0, 1 - inputs.efficiencyImprovementPercent / 100);
    const newKwhPerYear = baselineKwhPerYear * factor;
    const newCost = baselineCost * factor;
    const annualSavings = baselineCost - newCost;
    const savingsPercent = baselineCost > 0 ? (annualSavings / baselineCost) * 100 : 0;

    return {
      baselineKwhPerYear,
      baselineCost,
      newKwhPerYear,
      newCost,
      annualSavings,
      savingsPercent,
    };
  }, [inputs]);

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
                  value={String(inputs.energyCostPerKwh)}
                  min={0}
                  step="0.01"
                  onChange={update("energyCostPerKwh")}
                />
                <Field
                  label="Number of robots"
                  value={String(inputs.numberOfRobots)}
                  min={0}
                  step="1"
                  onChange={update("numberOfRobots")}
                />
                <Field
                  label="Average consumption per robot (kW)"
                  value={String(inputs.averageConsumptionKw)}
                  min={0}
                  step="0.1"
                  onChange={update("averageConsumptionKw")}
                />
                <Field
                  label="Operating hours per day"
                  value={String(inputs.operatingHoursPerDay)}
                  min={0}
                  step="1"
                  onChange={update("operatingHoursPerDay")}
                />
                <Field
                  label="Operating days per year"
                  value={String(inputs.operatingDaysPerYear)}
                  min={0}
                  step="1"
                  onChange={update("operatingDaysPerYear")}
                />
                <Field
                  label="Efficiency improvement (%)"
                  value={String(inputs.efficiencyImprovementPercent)}
                  min={0}
                  max={100}
                  step="1"
                  onChange={update("efficiencyImprovementPercent")}
                />

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setInputs({
                        energyCostPerKwh: 0.18,
                        numberOfRobots: 20,
                        averageConsumptionKw: 3.5,
                        operatingHoursPerDay: 16,
                        operatingDaysPerYear: 250,
                        efficiencyImprovementPercent: 15,
                      })
                    }
                    className="w-full md:w-auto inline-flex items-center justify-center rounded-md border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    Reset to examples
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 md:p-6 bg-white/50 dark:bg-black/30 backdrop-blur">
              <h2 className="text-base font-medium mb-4">Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <tbody className="divide-y divide-black/10 dark:divide-white/10">
                    <Row label="Robots" value={numberFmt.format(inputs.numberOfRobots)} />
                    <Row label="Baseline energy (kWh/year)" value={numberFmt.format(results.baselineKwhPerYear)} />
                    <Row label="Baseline cost (€/year)" value={currency.format(results.baselineCost)} />
                    <Row label="New energy (kWh/year)" value={numberFmt.format(results.newKwhPerYear)} />
                    <Row label="New cost (€/year)" value={currency.format(results.newCost)} />
                    <Row label="Annual savings" value={currency.format(results.annualSavings)} emphasis />
                    <Row label="Savings (%)" value={`${results.savingsPercent.toFixed(1)}%`} />
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-black/60 dark:text-white/60 mb-1">{label}</span>
      <input
        type="number"
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
