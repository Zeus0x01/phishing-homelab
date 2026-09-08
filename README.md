# Sentinel Range

Sentinel Range is a defensive phishing-awareness training homelab. Every message, URL, attachment, and login page is fictional template data rendered inside the app. The app never sends mail, performs network lookups for samples, or stores values entered into simulated credential forms.

## Architecture

- React 19, TanStack Start/Router, Tailwind CSS v4, Radix-compatible controls, Zustand, Zod, and Recharts.
- `labs/*.json` is the immutable template library. Definitions are validated with Zod when loaded.
- `src/lib/labs/` owns loading, rendering contracts, sanitization, and artifact extraction.
- `src/lib/engine/` contains deterministic artifact, rule, query, graph, and scoring logic.
- `src/lib/services/` contains server-side persistence services. PostgreSQL/Neon is used when `DATABASE_URL` exists; PGlite is the local fallback.
- `src/routes/api/` exposes validated JSON endpoints for labs, engine configuration, and progress.

## Add a lab

Create one JSON file in `labs/` that matches the template in [labs/README.md](labs/README.md). Include at least one validated step and one learning objective. Set `renderer` to an existing renderer (`generic`, `email-analysis`, `url-typospot`, or `credential-harvest`) or register a new `LabRenderer` module.

Email samples are template-only. Include explicit URLs, authentication results, attachments, language metadata, and raw source so the engine can produce deterministic artifacts without external services.

## Run locally

```sh
npm install
npm run dev
```

The app listens on `0.0.0.0:8080` through the repository's `npm run dev` contract. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` before deployment.

## Deployment

The Vercel Nitro target is configured in `vite.config.ts`. Set `DATABASE_URL` for Neon persistence; without it, local PGlite provides the fallback database. Keep the platform PWA/branding middleware, `startup.sh`, and `PreviewHostBridge` intact.

## Safety model

Rendered email is sanitized, placed in a sandboxed iframe with a restrictive CSP, and permanently watermarked as `TRAINING SIMULATION`. Verdicts and progress are simulated analytics. No user-entered credential value is persisted or transmitted.