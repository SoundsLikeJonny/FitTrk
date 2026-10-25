# FitTracker — Mobile App

React Native (Expo) mobile app for **Workout and Food Tracker**. It shares the
web app's backend and database — it has **no backend of its own**. All data access
goes through the typed API client generated from the web app's OpenAPI spec.

## Stack
- Expo + expo-router (file-based routing)
- React Query (via the generated hooks in `src/api/generated/`)
- react-native-paper (Material) + custom dark theme
- TypeScript

## Getting started
```bash
yarn install
yarn expo start
```

## Environment
The app reads the backend base URL from `EXPO_PUBLIC_API_URL`. Set it in your
shell or a local `.env` (never commit `.env`):
```
EXPO_PUBLIC_API_URL=https://<your-backend-host>
```
Auth uses runtime JWTs: the login/callback flow stores the bearer token securely
and `src/api/customFetch.ts` attaches it as the `Authorization` header. No secrets
are committed to the repo.

## Structure
- `app/` — screens & routes (auth, tabs, food-picker, workout, session)
- `src/api/generated/` — generated API client (do not edit by hand)
- `src/api/customFetch.ts` — fetch wrapper that injects the auth header
- `src/contexts/` — AuthProvider and app state
- `src/theme/` — colors, fonts, design tokens
- `src/utils/` — macro math & formatting helpers

## Features
Today's food log (macro bars, cut/bulk targets), food picker, workout templates,
active workout session with rest timer, workout history, and settings.

> This folder was added to the repo alongside the web app. See `MOBILE_PLAN.md`
> for the screen-by-screen plan and the web features each screen mirrors.
