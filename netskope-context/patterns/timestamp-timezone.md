# Pattern — Timestamp, Timezone, and Date Range

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/3474884072)

## Purpose

Date and time display rules so admins across timezones interpret data correctly.

## Rule

- **Default to UTC** in all backend-derived timestamps. Display `2026-05-28 14:32 UTC`.
- **Allow per-user timezone override** at the tenant level; when active, append the offset (`2026-05-28 07:32 PDT (-07:00)`).
- **In tables and dense views**, use the compact form: `2026-05-28 14:32` with the timezone shown once in the column header.
- **Relative times** (e.g., "3 minutes ago") only for events less than 24h old. Beyond 24h, use absolute.
- **Date range pickers**: always show start ≤ end. The default range is "Last 24 hours" for activity views and "Last 30 days" for analytics.
- **Never** use ambiguous formats like `05/28/26` or `28/05/26` — always use ISO `YYYY-MM-DD`.

## Components to use

- `<DatePicker />`, `<DateRangePicker />`, `<TimeInput />`, `<WeekHoursPicker />` from `@netskope-ui/dates-v2`
- Don't use the legacy `@netskope-ui/dates` package — it's deprecated
