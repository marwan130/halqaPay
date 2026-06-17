# HalqaPay Frontend — React Client

This is the web client for HalqaPay. It is a responsive, single-page application built with React, Vite, TypeScript, and Tailwind CSS. It is configured to support RTL (Right-to-Left) layouts by default, aligning with its target market in the Middle East.

---

## Design System & Core Libraries

We avoid standard design libraries in favor of a bespoke Tailwind config:
*   **Colors:** Deep Navy (`#1A3C5E`) as primary, Gold/Yellow (`#D4AF37`) as accents, and clean Slate/Gray for backgrounds.
*   **Fonts:** Outfitted with the clean *Inter* typeface.
*   **Zustand:** Powering client-side user sessions and persisting JWTs locally. Check [`src/store/authStore.ts`](file:///c:/Users/utd/Desktop/Projects/Java/halqaPay/halqapay-frontend/src/store/authStore.ts) to see how authentication persistence is set up.
*   **TanStack React Query:** Manages asynchronous network requests, automated cache invalidation, and data refetching.
*   **i18next:** Dynamically switches languages (English / Arabic). The app defaults to Arabic and applies RTL document styling (`dir="rtl"`) automatically when switched.

---

## Configuration (.env)

The frontend communicates with the backend via API variables. Create a `.env` file in the `halqapay-frontend` directory to customize endpoints:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Key Folders to Know

```
src/
├── api/            # API client modules using Axios with authorization interceptors
├── components/     # Reusable presentation and layout components
│   ├── circles/    # Join modals, creation forms, cards, and list grids
│   ├── dashboard/  # Interactive widgets (BurdenMeter, KycWidget, WalletCard)
│   └── shared/     # Notification inboxes, language switchers, currency formatters
├── hooks/          # Custom hooks wrapping queries and mutations
├── locales/        # JSON translation files (en.json, ar.json)
├── pages/          # Full page views (Landing, Dashboard, Admin simulation, etc.)
├── store/          # Zustand store definitions
├── types/          # TypeScript interfaces matching backend models
├── App.tsx         # Route registry and application shell
└── i18n.ts         # Internationalization config
```

---

## Running the Frontend

### 1. Installation
Install project dependencies first:
```bash
npm install
```

### 2. Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
To bundle the frontend for production hosting:
```bash
npm run build
```
To preview the production bundle locally:
```bash
npm run preview
```

---

## Internationalization & RTL Tips

1.  **Adding Translations:** All text strings must go into `src/locales/en.json` and `src/locales/ar.json`. Avoid hardcoding text directly into TSX components.
2.  **RTL Spacing:** Use logical classes where possible (e.g., `mx-auto` or `space-x-reverse` for horizontal flow layouts) to ensure that alignments adapt seamlessly when swapping between Arabic and English.
3.  **Language Switcher:** Users can toggle locales using the language dropdown selector in the navigation bar.