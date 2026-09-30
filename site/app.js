import { analyseRental, formatAUD } from "./model.js";

const form = document.querySelector("#checker-form");
const rentAmount = document.querySelector("#rent-amount");
const rentPeriod = document.querySelector("#rent-period");
const bondRequested = document.querySelector("#bond-requested");
const advanceRequested = document.querySelector("#advance-requested");
const vcatOrder = document.querySelector("#vcat-order");
const rentError = document.querySelector("#rent-error");
const sampleNote = document.querySelector(".sample-note");
let announcementTimer;

const nodes = {
  monthly: document.querySelector("#monthly-rent"),
  weekly: document.querySelector("#weekly-context"),
  status: document.querySelector("#rule-status"),
  bondLimit: document.querySelector("#bond-limit"),
  bondCheck: document.querySelector("#bond-check"),
  bondRow: document.querySelector("#bond-result-row"),
  advanceLimit: document.querySelector("#advance-limit"),
  advanceCheck: document.querySelector("#advance-check"),
  advanceRow: document.querySelector("#advance-result-row"),
  footnote: document.querySelector("#result-footnote"),
  announcement: document.querySelector("#result-announcement"),
};

const statusCopy = {
  within: "Does not exceed the standard limit",
  above: "Above the standard limit",
  special: "Exception applies — check the details",
  unentered: "Standard maximum",
};

function announceAfterTyping(message) {
  window.clearTimeout(announcementTimer);
  announcementTimer = window.setTimeout(() => {
    nodes.announcement.textContent = message;
  }, 450);
}

function setComparison(row, amountNode, checkNode, comparison, maximum) {
  row.classList.remove("is-over", "is-special");
  if (!comparison || comparison.status === "unentered") {
    amountNode.textContent = maximum === null ? "No standard cap" : formatAUD(maximum);
    checkNode.textContent = maximum === null ? "Exception applies" : statusCopy.unentered;
    if (maximum === null) row.classList.add("is-special");
    return;
  }
  if (comparison.status === "invalid") {
    amountNode.textContent = "Check amount";
    checkNode.textContent = "Enter zero or a positive amount";
    row.classList.add("is-special");
    return;
  }
  amountNode.textContent = formatAUD(comparison.requested);
  checkNode.textContent = comparison.status === "special" ? statusCopy.special : statusCopy[comparison.status];
  if (comparison.status === "above") row.classList.add("is-over");
  if (comparison.status === "special") row.classList.add("is-special");
}

function render() {
  const analysis = analyseRental({
    amount: rentAmount.value,
    period: rentPeriod.value,
    bondRequested: bondRequested.value,
    advanceRequested: advanceRequested.value,
    vcatHigherBond: vcatOrder.checked,
  });

  rentAmount.setAttribute("aria-invalid", String(!analysis.valid));
  rentError.textContent = analysis.valid ? "" : "Enter a rent amount greater than zero.";
  if (!analysis.valid) {
    nodes.monthly.textContent = "—";
    nodes.weekly.textContent = "Enter the rent from your agreement to see the standard figure.";
    nodes.status.innerHTML = '<span class="rule-icon" aria-hidden="true">!</span><span>Enter a valid rent amount to calculate the standard limits.</span>';
    nodes.bondLimit.textContent = "—";
    nodes.bondCheck.textContent = "Waiting for rent amount";
    nodes.advanceLimit.textContent = "—";
    nodes.advanceCheck.textContent = "Waiting for rent amount";
    nodes.footnote.textContent = "Your entries stay in this browser and are not saved or sent anywhere.";
    announceAfterTyping("Enter a rent amount greater than zero.");
    return;
  }

  nodes.monthly.textContent = formatAUD(analysis.monthlyRent);
  nodes.weekly.textContent = `Based on ${formatAUD(analysis.weeklyRent)} per week`;
  nodes.footnote.textContent = analysis.highRent
    ? "Above $900 per week, CAV says the usual one-month bond and advance-rent limits do not apply."
    : "Four weeks is 28 days. A calendar month is calculated from 365 ÷ 12 days, following CAV’s rent calculator.";

  let statusMessage;
  let statusClass = "";
  if (analysis.outOfScope) {
    statusMessage = "Different Victorian bond rules apply to this rental type. Use the CAV bond guide before comparing amounts.";
    statusClass = "is-warning";
  } else if (analysis.highRent) {
    statusMessage = "Weekly rent is over $900. CAV says the usual one-month bond cap and advance-rent limit do not apply.";
    statusClass = "is-warning";
  } else if (analysis.vcatHigherBond) {
    statusMessage = "You noted a VCAT order for a higher bond. The standard bond figure is not a limit for this property; the advance-rent rule is still shown separately.";
    statusClass = "is-warning";
  } else {
    statusMessage = "For weekly rent of $900 or less, the standard bond and advance-rent limit is one month.";
  }
  nodes.status.className = `result-rule ${statusClass}`.trim();
  nodes.status.innerHTML = `<span class="rule-icon" aria-hidden="true">${statusClass ? "i" : "✓"}</span><span>${statusMessage}</span>`;

  const bondMax = analysis.bondMaximum;
  const advanceMax = analysis.advanceMaximum;
  const bondComparison = analysis.bondComparison;
  const advanceComparison = analysis.advanceComparison;
  setComparison(nodes.bondRow, nodes.bondLimit, nodes.bondCheck, bondComparison, bondMax);
  setComparison(nodes.advanceRow, nodes.advanceLimit, nodes.advanceCheck, advanceComparison, advanceMax);

  const bondResult = analysis.bondMaximum === null
    ? "There is no standard bond cap for this exception."
    : `The standard bond maximum is ${formatAUD(analysis.bondMaximum)}.`;
  const advanceResult = analysis.advanceMaximum === null
    ? "The standard advance-rent limit does not apply for this exception."
    : `The standard rent-in-advance limit is ${formatAUD(analysis.advanceMaximum)}.`;
  announceAfterTyping(`${bondResult} ${advanceResult}`);

  if (analysis.outOfScope) {
    nodes.bondLimit.textContent = "Different rules";
    nodes.bondCheck.textContent = "See CAV guidance";
    nodes.advanceLimit.textContent = "Different rules";
    nodes.advanceCheck.textContent = "See CAV guidance";
    nodes.bondRow.classList.add("is-special");
    nodes.advanceRow.classList.add("is-special");
  }
}

form.addEventListener("input", () => {
  sampleNote.hidden = true;
  render();
});
form.addEventListener("change", () => {
  sampleNote.hidden = true;
  render();
});

document.querySelector("#reset-button").addEventListener("click", () => {
  form.reset();
  rentAmount.value = "550";
  rentPeriod.value = "weekly";
  sampleNote.hidden = false;
  render();
  rentAmount.focus();
});

render();
