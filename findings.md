# INGRYN — Repository Findings

_Date: 2026-06-11_

## Repository Overview

**INGRYN** is a React Native / Expo mobile app that scans product ingredient
labels (camera + ML Kit OCR), sends them to **Google Gemini 2.5 Flash** for
analysis, and shows per-ingredient safety levels, health concerns, and
country-by-country ban/restriction data.

**Stack:**
- Framework: Expo (React Native) — Expo `~56.0.9`, React `19.2.3`, RN `0.85.3`
- Navigation: Expo Router (file-based)
- Auth + DB: Supabase
- State: Zustand
- Styling: NativeWind (Tailwind for RN)
- AI: Google Gemini 2.5 Flash
- OCR: `@react-native-ml-kit/text-recognition`

**Size:** ~5,100 lines across 23 source files.

**Note:** `README.md` is a detailed PRD. The actual build is meaningfully past
the spec (onboarding and a dietary-preferences personalization feature exist
that aren't in the PRD).

## Architecture & What's Implemented

- **Routing (`app/`):** auth group (`welcome`, `signin`, `signup`,
  `onboarding`), tab group (`home`, `scanner`, `history`, `settings`), plus
  dynamic `results/[scanId]` and `ingredient/[ingredientId]` screens. Root
  `_layout.tsx` has an `AuthGate` that gates routes on the Supabase session.
- **Core flow (`hooks/useScanner.ts`, `hooks/useIngredientAnalysis.ts`,
  `lib/gemini.ts`):** capture → OCR → cache check → Gemini → save to Supabase →
  navigate to results.
- **Done well:** ingredient caching to avoid re-calling Gemini, race-condition
  handling on insert (`23505`), 429 retry with backoff, user-friendly error
  mapping, and a personalization layer (`personal_flag`) driven by user health
  conditions/allergies/diet.

## Notable Observations & Concerns

1. **PRD vs. implementation drift.** The README still references the Claude API
   in several places (§9.4, §13.2) though the build uses Gemini. It also lists
   RevenueCat/subscriptions and a `subscriptions` table that has no
   corresponding code. Monetization appears unbuilt.

2. **Security: Gemini API key is client-side.** `lib/gemini.ts` reads
   `EXPO_PUBLIC_GEMINI_API_KEY` and calls the API directly from the device.
   Anything `EXPO_PUBLIC_*` is bundled into the app and extractable. The PRD
   itself (§13.3, Open Question #6) flags that this should run server-side via a
   Supabase Edge Function. **This is the biggest issue.**

3. **Uncommitted work.** Onboarding, the `components/` folder, and the
   dietary-preferences hooks are untracked, and 7 files are modified but not
   committed. Worth committing before further changes.

4. **`expo-camera` vs ImagePicker.** `app.json` configures `expo-camera` and
   `useScanner` keeps `CameraView`/`cameraRef` state, but actual capture goes
   through `ImagePicker.launchCameraAsync` (comment notes it avoids
   `ERR_IMAGE_CAPTURE_FAILED`). There's also dead/unused camera state. Also
   `MediaTypeOptions` is deprecated in recent SDKs.

5. **Version note.** `AGENTS.md` instructs reading Expo **v56** docs before
   writing code, and `package.json` is on Expo `~56.0.9` with React `19.2.3` /
   RN `0.85.3`. This must be honored before making any code changes.

## File Inventory

```
app/_layout.tsx                      (83)   Root layout, AuthGate
app/index.tsx                        (23)   Entry redirect (onboarding/welcome)
app/(auth)/_layout.tsx               (11)
app/(auth)/onboarding.tsx            (310)  [untracked]
app/(auth)/signin.tsx                (319)
app/(auth)/signup.tsx                (356)
app/(auth)/welcome.tsx               (203)
app/(tabs)/_layout.tsx               (53)   Tab navigator
app/(tabs)/history.tsx               (333)
app/(tabs)/home.tsx                  (628)
app/(tabs)/scanner.tsx               (431)
app/(tabs)/settings.tsx              (538)
app/ingredient/[ingredientId].tsx    (314)
app/results/[scanId].tsx             (430)
components/DietaryPreferencesModal.tsx (294) [untracked]
components/ErrorBoundary.tsx         (106)  [untracked]
hooks/useDietaryPreferences.ts       (73)   [untracked]
hooks/useIngredientAnalysis.ts       (204)
hooks/useOnboarding.ts               (32)   [untracked]
hooks/useScanner.ts                  (190)
lib/gemini.ts                        (144)  Gemini wrapper + prompt builder
lib/supabase.ts                      (14)   Supabase client
store/index.ts                       (11)   Zustand auth store
```
