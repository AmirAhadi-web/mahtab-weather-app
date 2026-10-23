# Mahtab — Premium Weather Dashboard

Mahtab is a polished, desktop-first weather web app built with Next.js and the
Open-Meteo API. It presents current conditions, a 24-hour outlook, a compact
temperature chart and a 7-day forecast in a calm, editorial interface with a
custom dark/light visual system.

<!-- Add a screenshot after deployment, e.g. docs/screenshot.png -->
![Mahtab screenshot placeholder](docs/screenshot.png)

**Live demo:** _coming soon — deploy to Vercel and paste the URL here._

---

## Features

- **Current conditions hero** — temperature, condition, high/low, feels-like,
  humidity, wind and precipitation at a glance, local time (live clock in the
  city's timezone) and a calm, condition-aware weather illustration.
- **City search** — debounced Open-Meteo geocoding with keyboard navigation,
  loading/empty/error states, and cancellation of stale requests.
- **Browser geolocation** — opt-in "use my location" button with reverse
  geocoding and clear permission-error handling.
- **Hourly forecast** — horizontally scrolling next-24-hours strip with
  precipitation probabilities and a "now" marker.
- **Temperature chart** — compact Recharts area chart that follows the selected
  temperature unit.
- **7-day forecast** — daily highs/lows with week-scale temperature range bars
  and precipitation chances.
- **Weather details** — feels-like, wind (speed, direction, gusts), humidity,
  UV index, precipitation, and sunrise/sunset, all from live API data.
- **°C / °F toggle** — converts every temperature display consistently
  (displayed values are converted client-side; no refetch needed).
- **Dark & light themes** — dark-first design with a clean light theme,
  persisted via `localStorage` (next-themes).
- **Saved locations** — star cities to pin them in the search dropdown
  (localStorage only, no accounts).
- **States done properly** — dashboard skeletons, search spinner/empty state,
  blocking error with retry, non-blocking refresh errors, and graceful fallbacks
  for missing optional metrics.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + strict TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) — CSS-first design tokens
- shadcn-style UI primitives (`components/ui`) + [Lucide](https://lucide.dev) icons
- [Recharts](https://recharts.org) — lazy-loaded temperature chart
- [Geist](https://vercel.com/font) font, `next-themes` for dark/light mode
- [Open-Meteo](https://open-meteo.com) Forecast + Geocoding APIs (no key required)
- [Vitest](https://vitest.dev) for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables or API keys are required —
Open-Meteo allows keyless non-commercial use within its usage policy.

### Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Production build               |
| `npm run start`   | Start the production server    |
| `npm run lint`    | ESLint                         |
| `npm run typecheck` | TypeScript (no emit)         |
| `npx vitest run`  | Run unit tests                 |

## Architecture

```
src/
├── app/
│   ├── api/                 # thin server proxies (weather, geocode, reverse-geocode)
│   ├── layout.tsx / page.tsx / loading.tsx / error.tsx
│   └── globals.css          # Tailwind v4 tokens, keyframes, themes
├── components/
│   ├── ui/                  # card, skeleton, button primitives
│   └── weather/             # header, search, hero, details, hourly, chart, daily…
├── hooks/                   # use-weather, use-local-storage, use-favorites
├── lib/
│   ├── open-meteo.ts        # URL builders + raw payload normalization (pure, tested)
│   ├── weather-api.ts       # client fetch wrappers with typed errors
│   ├── weather-codes.ts     # WMO weather-code → label/kind mapping
│   └── utils.ts             # units, compass, UV, date formatting
└── types/weather.ts         # shared domain types
```

Data flows through one path: the browser calls the app's own `/api/*` route
handlers, which proxy Open-Meteo (with a 10-minute upstream cache), validate and
normalize the payload, and return UI-ready JSON. The client keeps data in React
state — no external state library.

## Weather codes

Open-Meteo returns WMO weather codes. `src/lib/weather-codes.ts` maps every code
to a readable label and a coarse "kind" (clear, cloudy, rain, snow, storm…),
which drives icons, the animated illustration, and ambient hero colors — one
reusable utility instead of scattered conditionals.

## API usage & attribution

- Forecast data: [Open-Meteo Forecast API](https://open-meteo.com/en/docs),
  non-commercial use, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- City search: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api).
- Reverse geocoding: [BigDataCloud free reverse geocode client](https://www.bigdatacloud.com/reverse-geocoding).

No API keys are used or required. Please follow each provider's terms of use.

## Deployment

The app is a standard Next.js project and deploys cleanly to Vercel:

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project**, import the repo (framework preset
   "Next.js" is detected automatically; no env vars needed).
3. Deploy, then replace the live-demo placeholder at the top of this README.

Any other platform that runs `npm run build` + `npm run start` works too.

## Accessibility & performance notes

- Keyboard-operable search combobox (arrow keys, Enter, Escape) with ARIA roles.
- Visible focus rings, accessible names on icon-only buttons, `prefers-reduced-motion`
  disables all decorative animation.
- The chart is dynamically imported (`ssr: false`) and rendered at a fixed height
  to avoid layout shifts; static shell renders server-side.

## Personalizing

- The developer footer (name, role, photo, GitHub/LinkedIn/Instagram, email,
  phone) is driven by `src/lib/developer.ts` — replace the placeholders with
  your own details and swap `public/images/developer.jpg` for your photo.
- Change the default city in `src/hooks/use-weather.ts` (`DEFAULT_LOCATION`).

## Screenshots

_Add screenshots here after deployment (desktop dark, mobile, light theme)._
