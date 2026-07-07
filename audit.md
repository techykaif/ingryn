# INGRYN — Full Codebase Audit

> **Date:** July 7, 2026  
> **Scope:** Entire Codebase (`app/`, `components/`, `hooks/`, `lib/`, `store/`, `constants/`, `supabase/functions/`)  
> **Stack:** Expo 56 · React Native 0.85 · Supabase · Zustand · Gemini 2.5 Flash

---

## Executive Summary

Massive progress has been made since the previous audit. **20 of the original 27 issues have been fully resolved.** The codebase is much more robust: Gemini API keys are secured, memory leaks are plugged, N+1 queries are fixed, and pagination is implemented. 

However, a deep re-audit has uncovered **3 new critical security/authorization flaws** (mostly around the new Edge Function and RLS) and **5 high-severity logic bugs** that must be addressed before launch. 

---

## 🟢 Previously Reported Issues (Resolved)

The following issues from the previous audit are now **FIXED**:
- **#1** Gemini API Key Exposed (Moved to Edge Function)
- **#2** `totalScans` stat always shows ≤ 5
- **#3** Double `startTipCycle()` memory leak
- **#4** Duplicate navigation on Auth success
- **#5** Email confirmation not handled in signup
- **#6** Reset-Password deep link route missing
- **#7** N+1 Supabase queries in `saveIngredients`
- **#8** `user?.id` undefined guard missing (in fetchers)
- **#9** Name update doesn't refresh auth store
- **#10** No timeout on processing screen (added 30s timeout)
- **#11** No `expo-splash-screen` integration
- **#13** Lockout timer memory leak in Sign In
- **#14** Non-functional Google Auth button (now shows "Coming soon")
- **#15** Hardcoded Safe Area Padding in Auth
- **#16, #17, #24** Onboarding flow issues (Onboarding removed entirely)
- **#19** ErrorBoundary uses dark theme
- **#20** `paleo` diet has no keyword matching
- **#21** No `.catch()` on critical async calls in Root Layout
- **#26** No pagination on history screen (Cursor-based added)

---

## 🔴 NEW Critical Issues (Must Fix immediately)

### C1. Edge Function: No Auth Verification (Cost Abuse / Prompt Injection)
- **Status:** ✅ FIXED (2026-07-07T14:04+05:30). Added JWT validation using `supabaseAdmin.auth.getUser` in `analyze-ingredients/index.ts`.

### C2. Edge Function: Prompt Injection via User Preferences
- **Status:** ✅ FIXED (2026-07-07T14:00+05:30). Validated preferences against strict allowlists before injecting them into the Gemini prompt in `analyze-ingredients/index.ts`.

### C3. `saveLabel` Missing User ID Guard (Authorization Bypass)
- **Status:** ✅ FIXED (2026-07-07T13:58+05:30). Added `.eq('user_id', user?.id)` filter to the update query in `app/results/[scanId].tsx`.

---

## 🟠 High Severity Issues

### H1. Harmful/Safe Stats Limited to 5 Recent Scans
- **Status:** ✅ FIXED (2026-07-07T14:06+05:30). Updated `home.tsx` to use separate `head: true` count queries for accurate global stats instead of calculating from the `.limit(5)` local array.

### H2. PKCE Compatibility for Password Reset 
- **Status:** ✅ FIXED (2026-07-07T14:07+05:30). Added logic to exchange `code` for session in `tryEstablishSession` before falling back to manual token parsing in `app/reset-password.tsx`.

### H3. Scanner Sends Empty `userId` When Null (Orphaned Data)
- **Status:** ✅ FIXED (2026-07-07T13:44+05:30). Added an early return guard in `processText` inside `hooks/useScanner.ts`.

### H4. `deleteAccount` Passes Potentially Undefined ID
- **Status:** ✅ FIXED (2026-07-07T13:43+05:30). Added `if (!user?.id) return` guard in `deleteAccount` in `app/(tabs)/settings.tsx`.

### H5. Welcome Page Legal Text Still Not Tappable (Compliance Risk)
- **Status:** ✅ FIXED (2026-07-07T13:42+05:30). Wrapped terms and privacy texts in `Text` tags with `onPress` routing to `/legal/[type]` in `welcome.tsx`.

---

## 🟡 Medium Severity Issues

### M1. Duplicate `react-native-url-polyfill` Imports
- **Status:** ✅ FIXED (2026-07-07T14:09+05:30). Uninstalled package and removed imports from `lib/supabase.ts` and `app/_layout.tsx`.

### M2. Missing Keyword Matching for `ibs` and `liver_disease`
- **Status:** ✅ FIXED (2026-07-07T13:46+05:30). Added `ibs` and `liver_disease` arrays to `conditionKeywords` in `results/[scanId].tsx`.

### M3. `loadMore` Overwrites History Search Filter
- **Status:** ✅ FIXED (2026-07-07T13:52+05:30). Added search filter condition before setting filtered state in `loadMore` within `app/(tabs)/history.tsx`.

### M4. Supabase Env Vars Missing Causes Silent Crash
- **Status:** ✅ FIXED (2026-07-07T14:08+05:30). Added explicit error throwing in `lib/supabase.ts` if environment variables are missing.

### M5. Processing Screen Missing Cancel Button
- **Status:** ✅ FIXED (2026-07-07T13:47+05:30). Added `cancelProcessing` logic to `useScanner.ts` and a Cancel button to `ProcessingScreen` in `scanner.tsx`.

### M6. `setTimeout` Not Cleared on Unmount
- **Status:** ✅ FIXED (2026-07-07T13:53+05:30). Stored timeouts in a ref and cleared them in `useEffect` cleanup in `app/reset-password.tsx` and `components/DietaryPreferencesModal.tsx`.

### M7. Ingredient Detail Silently Navigates Back on Error
- **Status:** ✅ FIXED (2026-07-07T13:53+05:30). Added proper error UI and state in `app/ingredient/[ingredientId].tsx`.

---

## 🟢 Low Severity / Polish

- **L1. `select('*')` Overfetching**
- **Status:** ✅ FIXED (2026-07-07T14:25+05:30). Explicitly selected columns in `app/(tabs)/history.tsx`, `app/results/[scanId].tsx`, `hooks/useDietaryPreferences.ts`, and `app/ingredient/[ingredientId].tsx` to reduce payload sizes.
- **L2. Duplicated Utility Functions:** ✅ FIXED (2026-07-07T13:36+05:30). Extracted to `lib/scanUtils.ts` and reused across `home.tsx`, `history.tsx`, and `results/[scanId].tsx`.
- **L3. Password Strength Misleading:** ✅ FIXED (2026-07-07T13:30+05:30). `signup.tsx` now checks for character variety (uppercase, lowercase, numbers, special characters) instead of just length.
- **L4. `ALLOWED_FREE_PROVIDERS` is Dead Code:** ✅ FIXED (2026-07-07T13:36+05:30). Removed dead code and optimized regex and array iteration in `lib/emailValidator.ts`.
- **L5. Missing `autoComplete`:** ✅ FIXED (2026-07-07T13:31+05:30). TextInputs in Auth screens now use proper `autoComplete` props for password manager integration.
- **L6. Hardcoded Safe Area in Legal:** ✅ FIXED (2026-07-07T13:32+05:30). `app/legal/[type].tsx` now correctly uses `useSafeAreaInsets()`.
- **L7. Results Modal Back Button:** ✅ FIXED (2026-07-07T13:33+05:30). Label edit modal now handles `onRequestClose`, fixing the Android hardware back button.

---

---

## 🔎 New Findings (July 7 Re-Audit)

### 1. `console.error` Silently Failing (Medium)
- **Files:** `app/(tabs)/home.tsx` (line 82), `hooks/useDietaryPreferences.ts` (lines 43, 69)
- **Description:** Errors caught in fetch routines are logged via `console.error` but never surfaced to the user via a Toast or the new `ConfirmDialog` error banners. If data fails to load, the UI may stay in an indefinite loading state or display blank data without informing the user.
- **Fix:** Plumb these errors into local state (e.g. `setErrorMsg`) and render them in the UI.

### 2. Missing `increment_scan_count` Invocation (Medium)
- **Files:** `hooks/useScanner.ts` / `hooks/useIngredientAnalysis.ts`
- **Description:** As noted in the PRD, the Supabase RPC `increment_scan_count` exists in the database schema but is never invoked by the client app after a successful scan. This makes it impossible to enforce the future 5 scans/month free-tier limit.
- **Fix:** Add a non-blocking `supabase.rpc('increment_scan_count', { user_id: user.id })` call immediately after saving the scan to history.

### 3. Verification of RPC Security (Pending Verification)
- **Description:** The PRD raises an open question regarding `delete_user_account` and `increment_scan_count`. We must verify directly in the Supabase Dashboard SQL editor that these functions internally enforce `auth.uid() = user_id`, rather than blindly trusting the `user_id` passed from the client payload.

---

## Recommended Action Plan

1. **Verify RPC Security (Finding 3)** directly in the Supabase dashboard to ensure no cross-user manipulation is possible.
2. **Plumb UI Errors (Finding 1)** for a better user experience on network failures.
3. **Wire up `increment_scan_count` (Finding 2)** to lay the foundation for Phase 4 (Monetization).
4. Proceed to **Phase 4: Monetization** as outlined in the PRD.
