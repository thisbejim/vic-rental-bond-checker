# BondCheck VIC

**Use it here: https://thisbejim.github.io/vic-rental-bond-checker/**

Check a Victorian rental bond and rent-in-advance request against Consumer Affairs Victoria's standard one-calendar-month guidance.

## What it does

Enter rent in the payment period shown in your agreement. BondCheck converts it using Consumer Affairs Victoria's calendar-month method, shows the standard bond and rent-in-advance figures, and compares amounts you were asked to pay.

## Why it exists

Some quick calculators estimate bond as four weeks of rent. CAV's usual limit is one calendar month's rent, and its rent calculator defines a calendar month using 365 days divided by 12. The difference can be material. This page puts that calculation and the main exceptions in one place, with links to the official guidance.

## Privacy

All calculations run in your browser. The site has no backend, analytics, advertising, or external runtime requests. Rent amounts are not saved or transmitted.

## Features

- Daily, weekly, fortnightly, monthly, six-monthly, and yearly rent input.
- Standard bond and rent-in-advance checks for Victorian private residential rentals.
- Explicit handling for the $900-per-week exception and a VCAT higher-bond order.
- Clear out-of-scope messaging for rental types with different rules.
- Responsive layout, keyboard support, and live result announcements.
- Current links to Consumer Affairs Victoria and Tenants Victoria.

This is a calculation aid, not legal advice. It does not cover every agreement or exception. Confirm your situation with Consumer Affairs Victoria or Tenants Victoria.

## Development

The published site is in `site/`. It has no build step or runtime dependencies. Serve that folder with any static HTTP server, or open `site/index.html` in a modern browser.

## Testing

Requires Node.js 20 or newer. Run:

```sh
npm test
```

The Node test suite covers all rent periods, the $900 threshold, special cases, invalid input, comparison boundaries, and currency formatting.

## Deployment

GitHub Actions publishes `site/` to GitHub Pages on pushes to `main`. The live URL is the link at the top of this README.

## Sources

- [Consumer Affairs Victoria: bond amounts and payments](https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/bond/bond-amounts-and-paying-a-bond)
- [Consumer Affairs Victoria: rent calculator](https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/rent/rent-calculator)
- [Tenants Victoria: private rental bonds](https://tenantsvic.org.au/explore-topics/starting-your-tenancy/bonds/private-rental/)

## License

MIT. See [LICENSE](./LICENSE).
