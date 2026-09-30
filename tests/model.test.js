import test from "node:test";
import assert from "node:assert/strict";
import { analyseRental, formatAUD, rentBreakdown } from "../site/model.js";

test("weekly rent follows CAV's 365-day calendar-month conversion", () => {
  const result = analyseRental({ amount: "550", period: "weekly" });
  assert.equal(result.monthlyRent.toFixed(2), "2389.88");
  assert.notEqual(result.monthlyRent, 550 * 4);
  assert.equal(result.weeklyRent, 550);
});

test("period conversions preserve the same calendar-month rent", () => {
  const weekly = rentBreakdown(700, "weekly");
  const daily = rentBreakdown(100, "daily");
  const fortnightly = rentBreakdown(1400, "fortnightly");
  const monthly = rentBreakdown(700 * 365 / 84, "monthly");
  const sixMonthly = rentBreakdown(700 * 365 / 14, "sixMonthly");
  const yearly = rentBreakdown(700 * 365 / 7, "yearly");
  for (const result of [daily, fortnightly, monthly, sixMonthly, yearly]) {
    assert.ok(Math.abs(result.monthlyRent - weekly.monthlyRent) < 0.01);
  }
});

test("the standard exception starts above, not at, $900 per week", () => {
  assert.equal(analyseRental({ amount: "900", period: "weekly" }).highRent, false);
  assert.equal(analyseRental({ amount: "900.01", period: "weekly" }).highRent, true);
  assert.equal(analyseRental({ amount: "900.01", period: "weekly" }).bondMaximum, null);
});

test("higher weekly rent suppresses both ordinary limits", () => {
  const result = analyseRental({
    amount: "950",
    period: "weekly",
    bondRequested: "8000",
    advanceRequested: "5000",
  });
  assert.equal(result.bondMaximum, null);
  assert.equal(result.advanceMaximum, null);
  assert.equal(result.bondComparison.status, "special");
  assert.equal(result.advanceComparison.status, "special");
});

test("a VCAT higher-bond order affects only the bond comparison", () => {
  const result = analyseRental({
    amount: "650",
    period: "weekly",
    bondRequested: "4000",
    advanceRequested: "1000",
    vcatHigherBond: true,
  });
  assert.equal(result.bondMaximum, null);
  assert.equal(result.bondComparison.status, "special");
  assert.equal(result.advanceMaximum, result.monthlyRent);
  assert.equal(result.advanceComparison.status, "within");
});

test("comparison distinguishes within, over, blank, zero and invalid amounts", () => {
  const maximum = 650 * 365 / 84;
  assert.equal(analyseRental({ amount: "650", period: "weekly", bondRequested: maximum.toFixed(2) }).bondComparison.status, "within");
  assert.equal(analyseRental({ amount: "650", period: "weekly", bondRequested: (Math.round(maximum * 100) / 100 + 0.01).toFixed(2) }).bondComparison.status, "above");
  assert.equal(analyseRental({ amount: "650", period: "weekly", bondRequested: "4000" }).bondComparison.status, "above");
  assert.equal(analyseRental({ amount: "650", period: "weekly" }).bondComparison.status, "unentered");
  assert.equal(analyseRental({ amount: "650", period: "weekly", bondRequested: "0" }).bondComparison.status, "within");
  assert.equal(analyseRental({ amount: "650", period: "weekly", bondRequested: "-1" }).bondComparison.status, "invalid");
});

test("non-private rental types are outside this checker", () => {
  const result = analyseRental({ amount: "600", period: "weekly", rentalType: "rooming" });
  assert.equal(result.outOfScope, true);
  assert.equal(result.bondMaximum, null);
  assert.equal(result.advanceMaximum, null);
});

test("empty, zero and unsupported rent inputs fail closed", () => {
  assert.equal(analyseRental({ amount: "", period: "weekly" }).valid, false);
  assert.equal(analyseRental({ amount: "0", period: "weekly" }).valid, false);
  assert.equal(analyseRental({ amount: "100", period: "unknown" }).valid, false);
});

test("money is formatted with Australian dollars", () => {
  assert.equal(formatAUD(2389.88), "$2,389.88");
  assert.equal(formatAUD(Number.NaN), "—");
});
