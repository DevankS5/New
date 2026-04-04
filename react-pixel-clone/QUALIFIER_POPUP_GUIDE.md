# Qualifier Popup Guide

This popup is now configuration-driven so you can add, remove, or reorder question pages without changing core popup logic.

## Main Files

- `src/qualifierFlow.js`
  - Main config for popup pages and fields.
  - Edit this file when you want to add or remove popup pages/questions.
- `src/App.jsx`
  - Generic popup renderer and navigation logic.
  - Handles first-page API submission before user continues.
- `src/BookingPage.jsx`
  - Post-qualifier booking page shown at `/book-call`.
  - Loads the Cal.com inline scheduler embed.
- `src/booking.css`
  - Dedicated styling for the booking page.
- `src/styles.css`
  - Shared popup styles.
  - Keep new elements inside existing `.qualifier-*` classes to preserve theme.
- `src/main.jsx`
  - Route setup for `/` and `/book-call`.
- `server/index.js`
  - Express + MongoDB API for first-screen lead capture.

## MongoDB Integration (First Question Screen)

When the first question page is submitted, the app sends this payload to:

- `POST /api/qualifier/first-screen`

Saved fields:

- `fullName`
- `emailAddress`
- `whatsAppNumber`
- `designationInCompany`
- `comfortableTimeForCommunication`

Environment variables used by the API server:

- `MONGODB_URI` (required)
- `MONGODB_DB` (optional)
- `PORT` (optional, default `8787`)

Use `.env` in project root (template: `.env.example`).

## Booking Page + Cal.com Embed

After the last qualifier page is submitted, users are routed directly to:

- `/book-call`

Cal.com embed environment variables:

- `VITE_CAL_LINK` (required for live booking)
  - Example: `username/strategy-call`
- `VITE_CAL_NAMESPACE` (optional, defaults to `orygin-strategy-call`)
- `VITE_CAL_ORIGIN` (optional, only needed for self-hosted Cal domains)
- `CAL_API_KEY` (optional, server-side only for future private API integrations)

If `VITE_CAL_LINK` is empty, the booking page shows a setup message instead of the live calendar.

## Popup Structure

In `src/qualifierFlow.js` the flow has 3 parts:

1. `intro`
2. `pages` (one or more question pages)
3. `success`

`pages` is the only section you usually change.

## Add a New Question Page

1. Open `src/qualifierFlow.js`.
2. Add a new object inside `pages`.
3. Give it a unique `id`, `title`, `copy`, and `fields`.
4. Save the file. The popup automatically includes the new page in flow + progress.

Example page object:

```js
{
  id: "lead-volume",
  title: "Lead Volume",
  copy: "Help us understand your current lead pipeline.",
  submitLabel: "Continue",
  fields: [
    {
      name: "monthlyLeads",
      label: "Monthly Leads",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select" },
        { value: "0-20", label: "0-20" },
        { value: "21-50", label: "21-50" },
        { value: "50+", label: "50+" }
      ]
    },
    {
      name: "leadSource",
      label: "Main Lead Source",
      type: "text",
      placeholder: "Meta Ads, YouTube, Referrals...",
      required: true,
      fullWidth: true
    }
  ]
}
```

## Remove or Reorder Pages

- Remove: delete a page object from `pages`.
- Reorder: move page objects up/down inside `pages`.

The popup order, progress bar, and navigation update automatically.

## Field Types Supported

Use these in each field object:

- `text`
- `email`
- `tel`
- `number`
- `select`
- `radio`
- `textarea`
- `checkbox-group` (multi-select)

Optional properties:

- `placeholder`
- `required` (true/false)
- `fullWidth` (true/false) for full-row fields
- `submitLabel` per page button text

## Keep the Same UI Theme

To preserve the current black-and-gold theme:

1. Reuse existing `.qualifier-*` classes.
2. Avoid inline styles inside popup JSX.
3. Add new style rules in `src/styles.css` near other `.qualifier-*` rules.
4. Keep button classes:
   - Primary action: `.qualifier-submit-btn`
   - Secondary action: `.qualifier-back-btn`

## Quick QA Checklist After Changes

1. Open popup from an Apply button.
2. Confirm each page loads in correct order.
3. Confirm required-field validation works per page.
4. Confirm progress bar updates page-to-page.
5. Confirm mobile layout under 540px width.
