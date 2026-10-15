# Daily No-Visit Monitoring

A fictional-data portfolio demonstration of a daily exception-reporting workflow built with SQL and JavaScript.

## Business problem

Locations with no recorded visits previously surfaced when a store or Franchise Business Partner noticed declining sales or visitor counts. I chose a daily automated email over a dashboard because recipients needed timely visibility without checking a report manually.

The production workflow runs on a daily timed trigger. Recipients investigate whether a single-day or multi-day gap has an expected explanation or needs follow-up. This repository demonstrates that logic locally. It contains no production data, credentials, recipients, or database connections, and never sends email.

## Run it

Install Node.js 20 or newer, unzip this folder, and open a terminal in it. No packages need to be installed.

```sh
npm start
npm test
npm start -- --date 2026-10-10
```

The default date is fixed to match the fictional fixtures. The CLI date is the activity date to review, not the execution date.

Outputs are written to `output/report.json` and `output/email-preview.txt`. Output is ignored by Git. With the default data, Redwood is flagged for two days and Willow for one day. Cedar has boarding activity and is excluded. Birch is closed and Pine has not opened yet.

## Workflow

1. Load fictional locations and visit records.
2. Exclude closed, terminated, or unopened locations.
3. Identify eligible locations with no recorded daycare or boarding activity on the reporting date.
4. Count consecutive calendar days since the latest activity, within the history window.
5. Write an email preview and structured report for review.

## Files

- `src/monitor.js`: pure reporting logic and email formatting.
- `src/index.js`: local input/output and CLI entry point.
- `data/`: fully invented locations and attendance records.
- `test/`: checks activity, streaks, eligibility, history limits, and invalid input.
- `sql/no-visit-monitoring.sql`: generic SQL Server reference query, separate from the executable JSON demo.

## Scope and intentional differences

This is a standalone adaptation of the original project, rather than a byte-for-byte copy. Production SQL connections and SMTP delivery are replaced with JSON fixtures and a local preview. An external timer is not included. Scheduling the original workflow is separate from running this demo.

Streaks count calendar days, including expected closures. Business schedules are not evaluated. Missing visit records are treated as no recorded visits, so the report is a prompt for investigation rather than proof that a location had no customers.

The lookback starts 365 days before the report date and includes both endpoints (up to 366 dates). `historyLimited` means the streak reaches the available boundary. As a demo refinement, streaks do not count dates before the location opened. The all-clear message says no eligible locations were flagged, rather than asserting that every location had actual visits.

The synthetic dataset is deliberately small and fixed. A different report date may flag more locations because no sample records exist for that date. Add fictional records to explore other scenarios. The SQL reference expects its documented tables to exist and is not executed by the Node application.

## Add to GitHub

Create a repository, then upload this folder’s contents (not the ZIP itself). Include `src`, `data`, `test`, `sql`, `README.md`, `package.json`, and `.gitignore`. Do not upload the original production ZIP. No open-source license is assumed; add one if you decide to grant reuse permissions.

## Outcome

The original workflow adds a daily notification to a previously reactive process and provides a consistent exception list with consecutive-day context. No measured time savings or financial impact are claimed.
