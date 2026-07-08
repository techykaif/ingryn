# Ingryn Codebase Audit & Status Report

## Current Status Overview
The codebase is generally well-structured with standard Expo Router patterns and clean responsive UI handling using `react-native-safe-area-context`. The authentication architecture, route protection (`AuthGate`), and error-handling flows are robust. A comprehensive re-audit has been performed across the repository. Below are the consolidated findings and their resolution status.

---

## 🔴 Critical Issues

### 1. `ImagePicker` Enum Type Error [FIXED]
- **File:** `hooks/useScanner.ts` (Line 181)
- **Issue:** `mediaTypes: ['images']` was incorrectly passed as an array instead of the expected enum value (`ImagePicker.MediaTypeOptions.Images`). This causes TypeScript compilation errors and potential runtime crashes in strict mode.
- **Status:** **Fixed**

### 2. Broken Supabase Query on Load [FIXED]
- **File:** `app/(tabs)/history.tsx` (Line 53 and 86)
- **Issue:** The `.select()` query asked for `ingredient_count`, which is a derived property and not a database column. This causes a PostgREST HTTP 400 error.
- **Status:** **Fixed** (Switched to querying `ingredient_ids` and deriving the length on both `fetchScans` and `loadMore`).

### 3. Screen Overflow on Small Devices [FIXED]
- **File:** `app/(auth)/welcome.tsx`
- **Issue:** The Welcome screen wraps its content in a `SafeAreaView` with `justifyContent: 'space-between'` but lacks a `ScrollView`. On smaller devices, this causes the UI to overflow, potentially pushing the primary "Get started" button off-screen and blocking signups.
- **Status:** **Fixed** (Wrapped content in a ScrollView)

### 4. Infinite App Hang on Font Load Failure [FIXED]
- **File:** `app/_layout.tsx` (Line 135)
- **Issue:** The code only checks `if (!fontsLoaded) return <ActivityIndicator />` but ignores the `fontError` property returned by `useFonts`. If fonts fail to load, `fontsLoaded` stays false forever, leaving the app indefinitely stuck on the native splash screen.
- **Status:** **Fixed** (Added error checking and hiding splash screen on error)

---

## 🟠 Medium Priority / Warnings

### 1. Unhandled Supabase Promise Rejections [FIXED]
- **File:** `app/(tabs)/home.tsx` (Lines 48-71)
- **Issue:** Four concurrent Supabase queries are run using `Promise.all`, but only the first query's `error` is checked. If the others fail, they fail silently resulting in incorrect `0` stat counts.

### 2. Memory Leak in SecureStore Chunks [FIXED]
- **File:** `lib/supabase.ts` (Line 28)
- **Issue:** In `ExpoSecureStoreAdapter.setItem`, if a new session string requires fewer chunks than the old session, the old leftover chunks are not deleted. Over time, these orphaned chunks leak the device's secure storage capacity.
- **Fix Needed:** Read the old `_meta` chunk count before overwriting and explicitly delete any obsolete chunk indices.

### 3. Potential Memory Leaks (State updates on unmounted components) [FIXED]
- **Files:** `app/(tabs)/settings.tsx` (Lines 75 and 99), `app/(auth)/signin.tsx` (Line 116)
- **Issue:** In settings, `setTimeout` is used to reset success flags. If the user navigates away before the timeout completes, React will warn. In signin, `setLoading(false)` is called in a `finally` block after a successful login triggers an immediate redirect (which unmounts the component).

### 4. Duplicate Network Requests (State Anti-Pattern) [FIXED]
- **File:** `hooks/useDietaryPreferences.ts` (Line 14-16)
- **Issue:** The hook wraps global Zustand state but executes `fetchPreferences` inside a local `useEffect`. Multiple mounted components calling the hook will trigger concurrent duplicate Supabase network requests.

### 5. Logic Bug in Date Formatting [FIXED]
- **File:** `lib/scanUtils.ts` (Line 20)
- **Issue:** Date differences are calculated using simple millisecond subtraction, vulnerable to edge cases (e.g., 11 PM yesterday vs 1 AM today yielding 0 days difference). Both dates should be normalized using `.setHours(0,0,0,0)` first.

### 6. Race Condition in Scanner Timeout Handler [FIXED]
- **File:** `hooks/useScanner.ts` (Line 92-98)
- **Issue:** The `setTimeout` handler for scan timeouts failed to increment `requestIdRef.current`. If a long-running analysis resolved after the timeout, it could unexpectedly redirect the user.
- **Status:** **Fixed**

### 7. Performance Issue (Inline Object/Function allocations in Lists) [FIXED]
- **File:** `app/(tabs)/history.tsx` (Lines 152 and 278)
- **Issue:** The `renderItem` function is declared inline, preventing `FlatList` optimizations and causing unnecessary re-renders on every keystroke.

### 8. Clipped Shadows on iOS [FIXED]
- **Files:** `app/(auth)/signin.tsx` & `app/(auth)/welcome.tsx`
- **Issue:** Button styles combine `overflow: 'hidden'` with shadows. On iOS, `overflow: 'hidden'` physically clips the drop shadow, rendering buttons flat.

---

## 🔵 Low Priority / Info & Best Practices

### 1. Store Destructuring Re-renders [FIXED]
- **File:** `app/_layout.tsx` (Line 32)
- **Issue:** `const { user, setUser } = useAuthStore()` subscribes the root `AuthGate` to the entire store. Adding unrelated state to the store later will cause the entire app tree to re-render unnecessarily.

### 2. Deep Link Parsing Reliability [FIXED]
- **File:** `app/reset-password.tsx` (Line 20)
- **Issue:** Uses `new URLSearchParams(raw)` which may not be perfectly polyfilled on older Androids. Safer to use Expo's native `Linking.parse(url)`.

### 3. Unused Imports & Cleanups [FIXED]
- **File:** `app/(tabs)/home.tsx` (Line 13) - Unused `Clock` import.
- **File:** `app/(tabs)/scanner.tsx` (Line 14) - Unused `IS_WEB` import.
- **File:** `lib/emailValidator.ts` (Lines 50, 63, 84) - Typo in blocklist (`'regbypass.comsafe-mail.net'`) and duplicate entries.
- **File:** `app/(auth)/signin.tsx` (Line 409) - Unused `googleIcon` style.

### 4. Typescript Type Duplication [FIXED]
- **Files:** `lib/gemini.ts` and `store/index.ts`
- **Issue:** `UserPreferences` and `DietaryPreferences` share exact structural types but are defined separately. They should be standardized.

### 5. Supabase RPC Security Consideration [NEEDS EXTERNAL VERIFICATION]
- **File:** `app/(tabs)/settings.tsx` (Line 128)
- **Issue:** Ensure the Postgres RPC function `delete_user_account` strictly validates `auth.uid() = target_user_id` inside the database, rather than relying solely on the client to pass the correct ID.
- **Status:** **Not verifiable from this repository.** The client passes the current user's ID, but the database function body is not present locally. Confirm directly in Supabase that the RPC checks `auth.uid() = target_user_id` server-side before deleting account data.
