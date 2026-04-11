# Ashel Gym

Expo Router app for tracking workouts, sets, calendar activity, and exercise
progress. The app uses local SQLite storage through Drizzle ORM and is built
for React Native with Expo SDK 54.

## Stack

- Expo Router
- React Native 0.81 / React 19
- Expo SQLite
- Drizzle ORM + Drizzle Kit
- Zustand
- FlashList, Reanimated, Victory Native, Skia

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm run start
```

3. Run on a target platform:

```bash
npm run android
npm run ios
npm run web
```

## Quality Checks

- `npm run lint` runs Expo ESLint rules
- `npm run lint:fix` applies autofixable ESLint changes
- `npm run typecheck` runs TypeScript without emitting files
- `npm run format` formats the repository with Prettier
- `npm run format:check` validates formatting without writing
- `npm run check` runs typecheck, lint, and format validation

## Database Workflow

- Schema lives in `db/schema.ts`
- Generated migrations live in `drizzle/`
- Create a new migration with:

```bash
npm run make-migrations
```

- Initial seed data is populated from `utils/populateDb.tsx`

## Useful Commands

- `npm run health-check` runs Expo Doctor
- `npm run upgrade-packages` aligns Expo package versions
- `npm run build-apk-file` starts the Android preview build through EAS

## Project Structure

- `app/` route files and screens
- `components/` shared UI and feature components
- `hooks/` reusable hooks over SQLite and UI behavior
- `store/` Zustand state
- `db/` schema and query helpers
- `constants/` theme values and image maps
- `utils/` seed logic, logging, and device helpers
- `assets/` fonts and images

## Current Verification Baseline

There is no automated test suite yet. The current minimum quality gate is:

```bash
npm run check
```

For behavior changes, also manually verify workout creation, stats modals, and
calendar flows in Expo.
