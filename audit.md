# INGRYN — Codebase Audit

> Reviewed: 2026-07-07 | Auditor: Antigravity AI
> Build in progress: EAS Preview (Android APK)

---

## Summary

| Severity                            | Count | Fixed |
| ----------------------------------- | ----- | ----- |
| 🔴 Critical (bug / data-loss)       | 4     | 2 ✅  |
| 🟠 High (silent failure / security) | 4     | 4 ✅  |
| 🟡 Medium (UX / correctness issue)  | 8     | —    |
| 🔵 Low (code quality / polish)      | 7     | —    |

---

## 🔴 Critical Issues

### 1. ✅ `SecureStore` adapter — promise leak fixed

**File:** `lib/supabase.ts` | **Status: FIXED**

`setItem` and `removeItem` now return their promises directly via arrow function shorthand. Keychain errors will no longer be silently swallowed.

```ts
// Fixed
getItem:    (key)        => SecureStore.getItemAsync(key),
setItem:    (key, value) => SecureStore.setItemAsync(key, value),
removeItem: (key)        => SecureStore.deleteItemAsync(key),
```

---

### 2. `fetchResults` in results screen has stale closure on `user`

**File:** `app/results/[scanId].tsx` (lines 53–80)

```ts
useEffect(() => { fetchResults() }, [scanId])  // fetchResults not in deps

async function fetchResults() {
  if (!user?.id) return  // 'user' captured at render time — stale closure
  ...
}
```

**Impact:** On token refresh or auth state change mid-session, `user` inside `fetchResults` may be stale. If the component mounts before auth resolves, it silently returns without loading data, leaving the user on a blank/loading screen with no error shown.

**Fix:** Move `fetchResults` into a `useCallback` with `[scanId, user?.id]` deps, or inline it fully inside the `useEffect`.

---

### 3. Scan deletion does not confirm `raw_ocr_text` (PII) is properly cleared

**File:** `app/(tabs)/history.tsx` (lines 113–133)

```ts
async function deleteScan(scanId: string) {
  const { error } = await supabase
    .from('scans').delete()
    .eq('id', scanId).eq('user_id', user?.id)
  ...
}
```

**Impact:** The `scans` row (including `raw_ocr_text` — the raw ingredient label text the user scanned) is deleted. This is correct. However, if Supabase RLS on the shared `ingredients` table is not properly configured, a user could query ingredient rows by UUID even after the parent scan is deleted. Verify RLS on the `ingredients` table enforces authenticated reads only.

---

### 4. ✅ `saveLabel` — error handling added

**File:** `app/results/[scanId].tsx` | **Status: FIXED**

- Added a dedicated `labelError` state (separate from the page-level fetch error)
- Empty input now shows `'Please enter a name for this scan.'` inline
- Supabase failures show the error message below the input with a red border
- Typing, closing the modal, or a successful save all clear the error

---

## 🟠 High Issues

### 5. ✅ Credentials — `.env` never committed to git (VERIFIED CLEAN)

**File:** `.env`

Confirmed via `git log --all -- .env .env.local` — the file has **zero commits** in the entire repository history. Keys have never been exposed.

**Remaining recommendation (low priority):**

- Ensure `.env` stays in `.gitignore` (it is).
- For CI/CD, prefer EAS Secrets (`eas secret:create`) over relying on the local `.env` file so secrets never touch build machines directly.

---

### 6. ✅ Google Sign-In — env var guard added

**File:** `lib/auth.ts` | **Status: FIXED**

Now throws immediately with a clear message if either env var is missing, instead of silently falling back to placeholder strings that cause a cryptic `DEVELOPER_ERROR` at runtime.

```ts
// Fixed
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
if (!webClientId || !iosClientId) {
  throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID...')
}
GoogleSignin.configure({ scopes: ['email', 'profile'], webClientId, iosClientId })
```

---

### 7. ✅ OCR review step — intentional by design (CLOSED)

**File:** `hooks/useScanner.ts`

After OCR extracts text from the photo, the app intentionally drops the user on the **"Review ingredients"** screen before sending anything to the AI. This prevents garbled/incorrect OCR output from being analysed without the user's awareness.

The only real issue was `processText` being listed in `recognizeFromUri`'s `useCallback` dep array despite never being called inside it. This was misleading and has been **cleaned up** — dep array now correctly reads `[stopTipCycle]` only.

---

### 8. ✅ `handleSignOut` — error handling added

**File:** `app/(tabs)/settings.tsx` | **Status: FIXED**

Now wrapped in `try/catch`. Local state and navigation only happen after a confirmed successful server-side sign-out. Failures are shown in the existing `deleteError` banner on the settings screen.

```ts
// Fixed
async function handleSignOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    router.replace('/(auth)/welcome')
  } catch (e: any) {
    setDeleteError(e.message || 'Could not sign out. Please try again.')
  }
}
```

---

### 9. `pageSize` defined inside component body passed to `useCallback` deps

**File:** `app/(tabs)/history.tsx` (line 41, 65)

```ts
const pageSize = 10  // defined inside component
const fetchScans = useCallback(async () => { ... }, [user, pageSize])
```

`pageSize` is a primitive literal in the component body — safe for now since `10 === 10`. But it is unnecessary in deps since it never changes, and if someone ever converts it to `useState`, it would cause infinite refetch loops.

**Fix:** Move `const PAGE_SIZE = 10` outside the component as a module-level constant and remove it from the `useCallback` dep array.

---

### 10. ✅ `delete_user_account` RPC — server-side auth guard confirmed (VERIFIED CLEAN)

**File:** `app/(tabs)/settings.tsx` (lines 110–112)

The Postgres function is confirmed to have a proper security gate:

```sql
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- 🔒 Caller MUST be deleting their own account
  IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account.';
  END IF;
  DELETE FROM public.profiles           WHERE id = target_user_id;
  DELETE FROM public.dietary_preferences WHERE user_id = target_user_id;
  DELETE FROM public.scans              WHERE user_id = target_user_id;
  DELETE FROM auth.users                WHERE id = target_user_id;
END;
$$;
```

`auth.uid()` is verified server-side before any deletion. No IDOR risk.

---

## 🟡 Medium Issues

### 11. `formatDate` returns 'Just now' for future timestamps (clock skew)

**File:** `lib/scanUtils.ts` (lines 22–25)

```ts
if (diff < 0) return 'Just now'
if (diff === 0) return 'Today'
```

If a scan's `created_at` is even 1ms in the future (server/client clock skew), `diff < 0` fires instead of `diff === 0`. Both should show 'Today'.

**Fix:** Change to `if (diff <= 0) return 'Today'` and remove the `diff < 0` branch.

---

### 12. Null safety score shows a green `CheckCircle` icon — false safe signal

**Files:** `app/(tabs)/home.tsx` (lines 291–294), `app/(tabs)/history.tsx` (lines 163–167)

When `safety_score` is `null`, `getScoreLabel` returns `'N/A'`. Neither `isHarmful` nor `isCaution` is true, so the `else` fallback renders a green `CheckCircle` icon — falsely implying the product is safe.

**Fix:** Add an explicit null/N/A check and render a neutral icon (e.g. `Question`) for unscored items.

---

### 13. `home.tsx` fetches full `ingredient_ids` array just to `.length` it

**File:** `app/(tabs)/home.tsx` (lines 49–52, 76)

```ts
.select('id, label, safety_score, created_at, ingredient_ids')
// ...
ingredient_count: s.ingredient_ids?.length || 0,
```

This fetches potentially hundreds of UUIDs per scan row just to count them. For users with many scans, this wastes significant bandwidth.

**Fix:** Store `ingredient_count` as a denormalized column on the `scans` table (updated on insert), or use a Postgres function to return the count only.

---

### 14. History search is client-side only — misses results on unloaded pages

**File:** `app/(tabs)/history.tsx` (lines 97–102)

Search only filters the currently loaded `scans` array. A user with 50+ scans who searches for an old label won't find it unless they scroll to load that page first.

**Fix:** Add a debounced server-side search using `.ilike('label', '%${query}%')` when a search term is active, replacing or supplementing the local filter.

---

### 15. Deep-link destination is lost after sign-in flow

**File:** `app/_layout.tsx` (lines 75–85)

A signed-out user who deep-links to `/results/some-id` gets redirected to `/(auth)/welcome`. After signing in, `AuthGate` sends them to `/(tabs)/home` — the original deep-link destination is lost.

This is expected behaviour for many apps, but worth documenting. Consider storing the intended route in a ref before redirect and restoring it after sign-in.

---

### 16. `DietaryPreferencesModal` Save button accessible while preferences are still loading

**File:** `components/DietaryPreferencesModal.tsx` (lines 199–216)

The ScrollView with preference chips shows an `ActivityIndicator` while loading, but the Save button is rendered outside the conditional and is always tappable. If pressed before `loading` resolves, saving the `DEFAULT` empty preferences would overwrite any existing saved data.

**Fix:** Add `disabled={loading || saving}` to the Save button.

---

### 17. Status bar safe area uses hardcoded values — incorrect on Dynamic Island devices

**Files:** `app/(tabs)/home.tsx`, `history.tsx`, `settings.tsx`, `scanner.tsx`, `results/[scanId].tsx`, `ingredient/[ingredientId].tsx`

```ts
paddingTop: Platform.OS === 'ios' ? 60 : 48,  // magic numbers repeated everywhere
```

On iPhone 14 Pro / 15 / 16 (Dynamic Island), the safe area inset is larger than 60pt. This is correctly handled in `signin.tsx` and `signup.tsx` using `useSafeAreaInsets()`, but not in the authenticated screens.

**Fix:** Import `useSafeAreaInsets` from `react-native-safe-area-context` in each tab screen and use `insets.top + baseOffset` for all status-bar-adjacent padding.

---

### 18. `reset-password.tsx` not reviewed — potential session race condition

**File:** `app/reset-password.tsx`

This screen handles incoming deep links from Supabase password reset emails. If a user who is already signed in on the device opens a reset link, and the reset flow creates a new session, the `onAuthStateChange` listener could fire a new `setUser()` call mid-navigation, potentially causing a race condition with any pending route guard logic.

**Recommendation:** Review and add a `useEffect` cleanup or a guard to prevent re-entrant auth state changes while the reset flow is in progress.

---

## 🔵 Low / Code Quality Issues

### 19. Empty component directories in repo

The following directories exist but are completely empty:

- `components/scanner/`
- `components/results/`
- `components/history/`
- `components/ui/`

Remove them or add placeholder files to reduce confusion.

---

### 20. Stale comment in `useIngredientAnalysis.ts`

**File:** `hooks/useIngredientAnalysis.ts` (line 2)

```ts
// removed unused import from './useDietaryPreferences'
```

Cleanup comment left behind. Remove it.

---

### 21. `scoreLabel` computed inline duplicates `getScoreLabel` utility

**File:** `app/results/[scanId].tsx` (line 176)

```ts
const scoreLabel = scan.safety_score >= 75 ? 'Safe' : scan.safety_score >= 45 ? 'Caution' : 'Harmful'
```

This exactly duplicates `getScoreLabel()` from `lib/scanUtils.ts`. Use the utility function to avoid divergence if thresholds change.

---

### 22. `@gorhom/bottom-sheet` imported as a dependency but not visibly used

**File:** `package.json` (line 7)

`@gorhom/bottom-sheet` is listed as a dependency but no import of it was found in any screen or component. Either it is used indirectly (e.g. a planned feature) or it is dead weight. Remove if unused to reduce bundle size.

---

### 23. `eas.json` CLI version constraint is too loose

**File:** `eas.json` (line 3)

```json
"version": ">= 16.0.0"
```

The installed CLI is v20.5.1. A loose `>= 16` constraint won't protect CI from breaking changes in a future major version.

**Fix:** Tighten to `>= 20.0.0` (or the exact version your team uses).

---

### 24. `app.json` has `newArchEnabled: false` — React Native New Architecture disabled

**File:** `app.json` (line 10)

React Native 0.85 ships with the New Architecture stable. `react-native-reanimated 4.x` and `react-native-gesture-handler 2.31` already work best (or exclusively) with the New Architecture enabled.

**Recommendation:** Test with `newArchEnabled: true`. The primary compatibility risk is `@react-native-ml-kit/text-recognition` — verify it supports the New Architecture before enabling.

---

### 25. Google button uses plain text "G" instead of the official Google logo

**Files:** `app/(auth)/signin.tsx` (line 355), `app/(auth)/signup.tsx` (line 279)

```ts
<Text style={styles.googleIcon}>G</Text>
```

Google's brand guidelines require using the official SVG logo on sign-in buttons, not a styled letter "G". This could technically violate Google's developer policies.

**Fix:** Use the official `@react-native-google-signin/google-signin` `GoogleSigninButton` component, or embed the official Google logo SVG asset.

---

| #  | Issue                               | Effort         | Status            |
| -- | ----------------------------------- | -------------- | ----------------- |
| 1  | SecureStore promise leak            | 2 lines        | ✅ Fixed          |
| 4  | `saveLabel` error swallowed       | 5 lines        | ✅ Fixed          |
| 6  | Google OAuth fallback strings       | 10 lines       | ✅ Fixed          |
| 8  | `handleSignOut` no error handling | 10 lines       | ✅ Fixed          |
| 5  | `.env` secrets                    | —             | ✅ Verified clean |
| 10 | `delete_user_account` RPC auth    | —             | ✅ Verified clean |
| 2  | Stale closure in`fetchResults`    | 15 lines       | ✅ Fixed          |
| 7  | OCR auto-submit regression          | dep cleaned up | ✅ By design      |
| 17 | SafeArea insets hardcoded           | Medium         | ✅ Fixed          |
| 14 | Client-side-only search             | Medium         | 🟡 Open           |
| 12 | Null score shows wrong icon         | 5 lines        | ✅ Fixed          |
| 16 | Save button active during loading   | 1 line         | ✅ Fixed          |
| 22 | `scoreLabel` duplicates utility   | 1 line         | ✅ Fixed          |
| 20 | Stale comment                       | 1 line         | ✅ Fixed          |
| 19 | Empty directories                   | Trivial        | ✅ Fixed          |
