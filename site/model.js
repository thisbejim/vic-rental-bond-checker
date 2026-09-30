const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = DAYS_PER_YEAR / 12;
const STANDARD_WEEKLY_THRESHOLD = 900;

const PERIOD_DAYS = Object.freeze({
  daily: 1,
  weekly: 7,
  fortnightly: 14,
  monthly: DAYS_PER_MONTH,
  sixMonthly: DAYS_PER_YEAR / 2,
  yearly: DAYS_PER_YEAR,
});

function toPositiveNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function toOptionalMoney(value) {
  if (value === "" || value === null || value === undefined) return { status: "unentered" };
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return { status: "invalid" };
  return { status: "entered", amount: number };
}

function compareAmount(requestedField, maximum) {
  if (requestedField.status === "unentered") return { status: "unentered" };
  if (requestedField.status === "invalid") return { status: "invalid" };
  if (maximum === null) return { status: "special", requested: requestedField.amount };
  const requested = requestedField.amount;
  const requestedCents = Math.round(requested * 100);
  const maximumCents = Math.round(maximum * 100);
  return {
    status: requestedCents > maximumCents ? "above" : "within",
    requested,
    maximum,
    difference: Math.max(0, (requestedCents - maximumCents) / 100),
  };
}

export function rentBreakdown(amount, period) {
  const rent = toPositiveNumber(amount);
  const days = PERIOD_DAYS[period];
  if (rent === null || !days) return null;
  const dailyRent = rent / days;
  return {
    dailyRent,
    weeklyRent: dailyRent * 7,
    fortnightlyRent: dailyRent * 14,
    monthlyRent: dailyRent * DAYS_PER_MONTH,
    sixMonthlyRent: dailyRent * (DAYS_PER_YEAR / 2),
    yearlyRent: dailyRent * DAYS_PER_YEAR,
  };
}

export function analyseRental({
  amount,
  period,
  bondRequested = "",
  advanceRequested = "",
  vcatHigherBond = false,
  rentalType = "private",
}) {
  const breakdown = rentBreakdown(amount, period);
  if (!breakdown) return { valid: false };

  const highRent = Math.round(breakdown.weeklyRent * 100) > STANDARD_WEEKLY_THRESHOLD * 100;
  const outOfScope = rentalType !== "private";
  const bondMaximum = outOfScope || highRent || vcatHigherBond ? null : breakdown.monthlyRent;
  const advanceMaximum = outOfScope || highRent ? null : breakdown.monthlyRent;
  const bondField = toOptionalMoney(bondRequested);
  const advanceField = toOptionalMoney(advanceRequested);

  return {
    valid: true,
    ...breakdown,
    highRent,
    outOfScope,
    vcatHigherBond: Boolean(vcatHigherBond),
    standardWeeklyThreshold: STANDARD_WEEKLY_THRESHOLD,
    bondMaximum,
    advanceMaximum,
    bondComparison: compareAmount(bondField, bondMaximum),
    advanceComparison: compareAmount(advanceField, advanceMaximum),
  };
}

export function formatAUD(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
