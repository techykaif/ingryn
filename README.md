# INGRYN — Product Requirements Document

**Version:** 2.1  
**Date:** June 2026  
**Status:** Active Development  
**Platform:** iOS + Android (React Native / Expo)  
**Last Updated:** June 2026 — UI overhaul, design system, dietary preferences fix, routing fixes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Competitive Landscape](#5-competitive-landscape)
6. [Product Scope](#6-product-scope)
7. [Feature Requirements](#7-feature-requirements)
8. [Screen Specifications](#8-screen-specifications)
9. [Technical Architecture](#9-technical-architecture)
10. [Data Models & Database Schema](#10-data-models--database-schema)
11. [API Specifications](#11-api-specifications)
12. [Monetization Model](#12-monetization-model)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Release Phases](#14-release-phases)
15. [Open Questions & Risks](#15-open-questions--risks)

---

## Changelog

| Version | Date | Summary |
|---|---|---|
| 1.0 | June 2026 | Initial PRD |
| 2.0 | June 2026 | Major update: Phase 1–3 complete, auth hardening, ingredient caching |
| 2.1 | June 2026 | UI overhaul complete: design system, Phosphor icons, Plus Jakarta Sans, light theme, dietary preferences fix, onboarding routing fix, signup bug fix |

---

## 1. Executive Summary

INGRYN is a mobile-first SaaS application that allows users to scan product ingredient labels using their phone camera and instantly receive AI-powered analysis. The app identifies each ingredient, provides clear definitions, flags potentially harmful substances, and highlights ingredients that are banned or restricted in specific countries.

INGRYN is targeted at health-conscious consumers, parents, people with dietary restrictions, travellers, and anyone who wants to understand what is actually inside the products they buy — without needing a chemistry degree.

**Current status:** Full UI overhaul complete. All screens rebuilt with premium light natural theme, Plus Jakarta Sans typography, Phosphor icons, and LinearGradient CTAs. Dietary preferences flagging fully wired. Monetisation (Phase 4) is next.

---

## 2. Problem Statement

### The core problem
Modern consumer products contain dozens of synthetic compounds, preservatives, flavour enhancers, and chemical additives. The average person cannot interpret ingredient labels. Even informed consumers struggle to:

- Understand what individual chemical ingredients actually are
- Know which ingredients are considered harmful or controversial
- Know that an ingredient legal in their country may be banned elsewhere
- Keep up with evolving food safety research

### Why existing solutions fall short
- **Google search**: Requires searching each ingredient one by one
- **EWG / Think Dirty**: Limited product database, no camera OCR, no real-time AI analysis
- **Open Food Facts**: Crowdsourced, incomplete, no country-specific ban data
- **Yuka**: No depth of AI-powered per-ingredient explanations, no country ban tracking

### The INGRYN opportunity
A single camera scan → instant, structured, AI-powered breakdown of every ingredient in under 10 seconds. No manual input. No product database dependency. Works on any label.

---

## 3. Goals & Success Metrics

### Business Goals
| Goal | Metric | Target (6 months post-launch) |
|---|---|---|
| User acquisition | Total installs | 10,000 |
| Activation | Users who complete first scan | ≥ 60% of installs |
| Retention | DAU/MAU ratio | ≥ 25% |
| Monetisation | Free-to-paid conversion | ≥ 5% |
| Revenue | Monthly Recurring Revenue | $2,000 MRR |

### Product Goals
- Scan-to-results time under 10 seconds on a mid-range device
- OCR accuracy ≥ 90% on standard product labels
- AI analysis covers 100% of detected ingredients
- App Store rating ≥ 4.3 stars

---

## 4. User Personas

### Persona 1 — The Health-Conscious Parent
**Name:** Priya, 34 | **Location:** Mumbai  
Wants to avoid artificial colours and preservatives in food for her kids.  
**Key feature:** Safety flags + dietary preference alerts

### Persona 2 — The Traveller / Expat
**Name:** Marco, 28 | **Location:** EU ↔ US  
Needs to know if ingredients legal in US are banned at home in Italy.  
**Key feature:** Country-specific ban data per ingredient

### Persona 3 — The Fitness Enthusiast
**Name:** Aanya, 25 | **Location:** Delhi  
Wants to understand every ingredient in her supplements and protein bars.  
**Key feature:** Full AI descriptions + category tags

### Persona 4 — The Allergy Sufferer
**Name:** Rahul, 41 | **Location:** Bangalore  
Has sulphite sensitivity and needs to detect hidden allergens by chemical name.  
**Key feature:** Dietary preference flagging + aliases (E220 = Sulphur Dioxide)

---

## 5. Competitive Landscape

| App | OCR Scan | AI Analysis | Country Bans | Allergen Detection | Premium UI |
|---|---|---|---|---|---|
| **INGRYN** | ✅ | ✅ Gemini 2.5 Flash | ✅ 8 countries | ✅ Personalised | ✅ |
| Yuka | ✅ | ❌ Static DB | ❌ | Partial | ✅ |
| Think Dirty | ❌ Manual | ❌ Static DB | ❌ | ❌ | ❌ |
| Open Food Facts | ❌ Barcode | ❌ Community | ❌ | Partial | ❌ |
| EWG Healthy Living | ❌ Barcode | ❌ Static DB | ❌ | ✅ | ❌ |

---

## 6. Product Scope

### Completed

- ✅ User authentication (email/password) with full error handling and rate limiting
- ✅ Forgot password flow (inline, no separate screen)
- ✅ Email validation with 300+ disposable domain blocklist
- ✅ Auth guard preventing unauthenticated access
- ✅ Camera-based ingredient scanning + gallery fallback
- ✅ OCR text extraction
- ✅ AI-powered ingredient analysis via Gemini 2.5 Flash
- ✅ Per-ingredient definitions, safety ratings, and category tags
- ✅ Country ban/restriction flags (US, EU, UK, India, Australia, Canada, Japan, China)
- ✅ Ingredient caching in Supabase
- ✅ `personal_flag` from Gemini saved to ingredients table and displayed on results
- ✅ Dietary preferences (conditions, allergies, diet type) saved + flagging on results
- ✅ Scan history with delete + search
- ✅ Ingredient detail view
- ✅ Settings (edit name, change password, delete account, app version)
- ✅ Session persistence
- ✅ Onboarding (4-slide natural theme, fixed routing loop)
- ✅ Full UI overhaul — premium light natural theme across all screens
- ✅ Design system (`constants/theme.ts`) — Colors, Fonts, Spacing, Radius, Shadows
- ✅ Plus Jakarta Sans typography throughout
- ✅ Phosphor icons replacing lucide-react-native
- ✅ LinearGradient CTAs and safety cards
- ✅ Seed dataset — 117 common ingredients pre-loaded in Supabase

### In Progress / Next
- 🔲 Google OAuth
- 🔲 RevenueCat subscription integration
- 🔲 Paywall screen + feature gating
- 🔲 Free tier scan limit enforcement (5 scans/month)
- 🔲 OCR text review/edit before analysis (SCAN-06)

### Out of Scope — v1.0
- Barcode scanning
- Social/sharing features
- Web app
- Offline mode
- Multi-language label OCR
- Nutritional analysis
- PDF export

---

## 7. Feature Requirements

### 7.1 Authentication ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| AUTH-01 | Email + password sign up | P0 | ✅ Done |
| AUTH-02 | Google OAuth | P0 | 🔲 Pending |
| AUTH-03 | Reset password via email | P0 | ✅ Done |
| AUTH-04 | Session persists across restarts | P0 | ✅ Done |
| AUTH-05 | Sign out | P0 | ✅ Done |
| AUTH-06 | Onboarding flow for new users | P1 | ✅ Done |
| AUTH-07 | Returning users go directly to home | P0 | ✅ Done |
| AUTH-08 | Inline error messages (no Alert.alert) | P0 | ✅ Done |
| AUTH-09 | Rate limiting — 5 attempts → exponential backoff | P0 | ✅ Done |
| AUTH-10 | Disposable email blocking (300+ domains) | P0 | ✅ Done |
| AUTH-11 | Edit display name | P1 | ✅ Done |
| AUTH-12 | Change password | P1 | ✅ Done |
| AUTH-13 | Delete account (Supabase RPC) | P1 | ✅ Done |

### 7.2 Scanner ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| SCAN-01 | Camera permission request | P0 | ✅ Done |
| SCAN-02 | Live camera with crop guide | P0 | ✅ Done |
| SCAN-03 | Capture button | P0 | ✅ Done |
| SCAN-04 | OCR text extraction | P0 | ✅ Done |
| SCAN-05 | Ingredient list parsed from OCR | P0 | ✅ Done |
| SCAN-06 | Review/edit OCR text before analysis | P1 | 🔲 Pending |
| SCAN-07 | Gallery image picker fallback | P1 | ✅ Done |
| SCAN-08 | Manual text entry fallback | P1 | ✅ Done |
| SCAN-09 | Processing state with tips | P0 | ✅ Done |
| SCAN-10 | Scan-to-result under 10 seconds | P0 | ✅ Done |
| SCAN-11 | Free tier scan limit (5/month) | P1 | 🔲 Pending (Phase 4) |

### 7.3 AI Analysis ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| AI-01 | Gemini 2.5 Flash returns structured JSON | P0 | ✅ Done |
| AI-02 | Name, aliases, category, description, safety level, country bans | P0 | ✅ Done |
| AI-03 | Country coverage: US, EU, UK, India, Australia, Canada, Japan, China | P0 | ✅ Done |
| AI-04 | Unknown ingredients flagged as "unverified" | P0 | ✅ Done |
| AI-05 | Ingredient caching in Supabase | P1 | ✅ Done |
| AI-06 | JSON-only response (no preamble) | P0 | ✅ Done |
| AI-07 | `personal_flag` returned per ingredient based on user preferences | P1 | ✅ Done |
| AI-08 | `personal_flag` persisted to ingredients table | P1 | ✅ Done |

### 7.4 Results Screen ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| RES-01 | Grouped by safety: Harmful → Caution → Safe | P0 | ✅ Done |
| RES-02 | Ingredient card: name, category, safety badge, 1-line summary | P0 | ✅ Done |
| RES-03 | Tap ingredient → detail screen | P0 | ✅ Done |
| RES-04 | Overall safety score ring | P1 | ✅ Done |
| RES-05 | Country ban summary alert | P1 | ✅ Done |
| RES-06 | Auto-saved to history | P0 | ✅ Done |
| RES-07 | Scan naming/labelling | P1 | ✅ Done |
| RES-08 | Personal dietary flag banners per ingredient | P1 | ✅ Done |
| RES-09 | Summary alert for total flagged ingredients | P1 | ✅ Done |

### 7.5 Ingredient Detail ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| DET-01 | Full name + aliases/E-numbers | P0 | ✅ Done |
| DET-02 | Category chip | P0 | ✅ Done |
| DET-03 | Full AI description | P0 | ✅ Done |
| DET-04 | Safety level with LinearGradient card | P0 | ✅ Done |
| DET-05 | Country-by-country status table | P0 | ✅ Done |
| DET-06 | Health concerns list | P1 | ✅ Done |
| DET-07 | Banned/restricted country count chips | P1 | ✅ Done |
| DET-08 | Common products | P2 | 🔲 Future |

### 7.6 History ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| HIS-01 | Chronological scan list | P0 | ✅ Done |
| HIS-02 | Scan card: name, date, score, ingredient count | P0 | ✅ Done |
| HIS-03 | Tap to reopen results | P0 | ✅ Done |
| HIS-04 | Delete scan (with confirmation) | P1 | ✅ Done |
| HIS-05 | Synced to Supabase | P0 | ✅ Done |
| HIS-06 | Search/filter by product name | P1 | ✅ Done |

### 7.7 Settings ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| SET-01 | View name and email | P0 | ✅ Done |
| SET-02 | Edit display name (inline) | P1 | ✅ Done |
| SET-03 | Change password (inline) | P1 | ✅ Done |
| SET-04 | Delete account | P1 | ✅ Done |
| SET-05 | Dietary preferences modal | P1 | ✅ Done |
| SET-06 | Subscription status + upgrade CTA | P0 | 🔲 Pending (Phase 4) |
| SET-07 | Privacy policy / Terms links | P1 | 🔲 Coming soon placeholder added |
| SET-08 | App version display | P2 | ✅ Done (v1.0.0) |
| SET-09 | Restore purchases | P0 | 🔲 Pending (Phase 4) |

### 7.8 Subscription & Paywall 🔲 Next Phase

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PAY-01 | Free tier: 5 scans/month | P0 | 🔲 Pending |
| PAY-02 | Pro tier: unlimited scans + full data | P0 | 🔲 Pending |
| PAY-03 | Paywall on limit/locked feature | P0 | 🔲 Pending |
| PAY-04 | RevenueCat (iOS + Android unified) | P0 | 🔲 Pending |
| PAY-05 | Subscription state synced to Supabase | P1 | 🔲 Pending |
| PAY-06 | Restore purchases | P0 | 🔲 Pending |

---

## 8. Screen Specifications

### 8.1 Onboarding ✅ Implemented
**Route:** `/(auth)/onboarding`

4-slide natural light theme walkthrough. Scan → Know → Global → Personal. Each slide has a live UI preview widget (scan viewfinder, ingredient cards, country table, preference chips). Writes to AsyncStorage on completion. Navigation: Get started → welcome, Sign in → signin, Skip → welcome. One-time only — routing reads AsyncStorage directly to avoid dual-instance hook conflict.

---

### 8.2 Welcome ✅ Implemented
**Route:** `/(auth)/welcome`

Premium light theme. INGRYN logo with green gradient + Leaf icon. Tagline, 3 feature cards (Scan/ShieldCheck/Globe Phosphor icons), stats strip (10s/117+/8), full-width LinearGradient CTA, Google button, sign in link, legal text.

---

### 8.3 Sign In ✅ Implemented
**Route:** `/(auth)/signin`

Light theme. Inputs with Phosphor icons (EnvelopeSimple, Lock, Eye/EyeSlash). Inline error banners with Warning icon. Rate limiting lockout shown in amber banner. Forgot password inline (same screen) with CheckCircle success state. LinearGradient sign in button with ArrowRight.

---

### 8.4 Sign Up ✅ Implemented
**Route:** `/(auth)/signup`

Light theme. Three inputs with icons (UserCircle, EnvelopeSimple, Lock). PasswordStrength bars (red/amber/green). Inline error banners. Email validation against disposable blocklist. LinearGradient CTA. Legal text at bottom.

---

### 8.5 Home ✅ Implemented
**Route:** `/(tabs)/home`

Greeting with first name + avatar. LinearGradient hero scan card. Three stat cards (Total/Harmful/Safe). Recent scans list with score rings. Empty state with Leaf icon and green gradient scan button. Pro tip card.

---

### 8.6 Scanner ✅ Implemented
**Route:** `/(tabs)/scanner`

Camera screen stays dark (correct for UX). Light theme for permission, processing, and manual entry screens. Processing screen has animated ring + tip dots. Permission screen has green gradient camera icon. Manual entry has clean TextInput with gradient analyse button. Camera: corner guides, green scan line, circular capture button, gallery/manual side buttons.

---

### 8.7 Results ✅ Implemented
**Route:** `/results/[scanId]`

Light theme. Score card with large number + ring. Stats strip (Harmful/Caution/Safe/Banned). Purple personal flag alert banner. Red ban alert banner. Ingredient cards with safety badges, personal flag rows (purple), health concern rows (amber). Scan naming modal with LinearGradient button.

---

### 8.8 Ingredient Detail ✅ Implemented
**Route:** `/ingredient/[ingredientId]`

Light theme. Category chip header. LinearGradient safety card (green/amber/red/grey). Banned/restricted country count chips. About section, health concerns list, full country status table with flag emojis and coloured status chips. Alias grid as white cards.

---

### 8.9 History ✅ Implemented
**Route:** `/(tabs)/history`

Light theme. Search bar with X clear button. FlatList with score rings, safety badges, delete buttons. Empty state with ClockCounterClockwise icon. Search empty state with clear button.

---

### 8.10 Settings ✅ Implemented
**Route:** `/(tabs)/settings`

Light theme. Profile card with LinearGradient avatar, Free tier badge. Section headers. Inline name/password editing with save/cancel. Dietary preferences row → opens modal. Privacy/TOS (Coming soon). App version. Red sign out button. Subtle delete account link.

---

### 8.11 Paywall 🔲 Pending
**Route:** `/paywall` (modal)  
Phase 4 — RevenueCat integration.

---

## 9. Technical Architecture

### 9.1 Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | Expo SDK 56 (React Native) | ✅ |
| Navigation | Expo Router (file-based) | ✅ |
| Auth | Supabase Auth | ✅ |
| Database | Supabase (PostgreSQL) | ✅ |
| OCR | Expo Camera + Image Picker | ✅ |
| AI Analysis | Google Gemini 2.5 Flash | ✅ |
| Ingredient Cache | Supabase `ingredients` table | ✅ |
| Design System | `constants/theme.ts` | ✅ |
| Typography | Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`) | ✅ |
| Icons | Phosphor Icons (`phosphor-react-native`) | ✅ |
| Gradients | `expo-linear-gradient` | ✅ |
| Haptics | `expo-haptics` | ✅ |
| Blur | `expo-blur` | ✅ |
| Animations | `lottie-react-native` | ✅ installed |
| Bottom Sheet | `@gorhom/bottom-sheet` | ✅ installed |
| Subscriptions | RevenueCat | 🔲 Pending |
| State Management | Zustand (`store/index.ts`) | ✅ |
| Session Storage | AsyncStorage | ✅ |
| Email Validation | `lib/emailValidator.ts` (300+ blocklist) | ✅ |

### 9.2 Design System — `constants/theme.ts`

All UI tokens centralised:
- **Colors** — primary (#22C55E), background (#F8FAFC), surface (#FFFFFF), semantic (success/warning/danger), safety levels (safe/caution/harmful/unknown), country status, personal flag (#8B5CF6)
- **Fonts** — PlusJakartaSans weights: 200–800 + italics
- **FontSizes** — xs(11) through 7xl(42)
- **Spacing** — xs(4) through 6xl(64)
- **Radius** — sm(6) through full(9999)
- **Shadows** — sm/md/lg/primary/danger
- **SafetyConfig** — label + color + bg + icon per level
- **CountryStatusConfig** — label + color + bg per status

### 9.3 Key Technical Decisions & Resolved Issues

| Issue | Resolution |
|---|---|
| `Alert.alert` silent on web | Replaced with inline error banners across all auth screens |
| Onboarding routing loop | `_layout.tsx` reads AsyncStorage directly per segment change; `!inAuthGroup` guard added |
| `signup.tsx` had signin code | Rebuilt correctly with `handleSignUp`, `fullName`, `PasswordStrength` |
| `app/index.tsx` routing conflict | Simplified to loading spinner — all routing owned by `_layout.tsx` |
| Dual `useOnboarding` hook instances | Removed from `_layout.tsx`; direct AsyncStorage read instead |
| `personal_flag` dropped on Supabase insert | Added to `saveIngredients()` in `useIngredientAnalysis.ts` |
| `dietary_preferences` upsert `23505` error | Added `{ onConflict: 'user_id' }` to upsert call |
| `ScanLine` not in Phosphor | Renamed to `Scan`; aliased as `ScanIcon` where local type conflict exists |
| `--legacy-peer-deps` required | All npm installs use this flag — documented |

### 9.4 Project Folder Structure

```
ingryn/
├── app/
│   ├── _layout.tsx              ✅ Auth gate + font loading + onboarding routing
│   ├── index.tsx                ✅ Loading spinner only (no routing)
│   ├── (auth)/
│   │   ├── _layout.tsx          ✅
│   │   ├── onboarding.tsx       ✅ Natural light theme, 4 slides
│   │   ├── welcome.tsx          ✅ Premium light theme
│   │   ├── signin.tsx           ✅ Premium light theme + rate limiting + forgot password
│   │   └── signup.tsx           ✅ Premium light theme + PasswordStrength
│   ├── (tabs)/
│   │   ├── _layout.tsx          ✅ Phosphor icons + floating scan button
│   │   ├── home.tsx             ✅ Premium redesign
│   │   ├── scanner.tsx          ✅ Premium redesign
│   │   ├── history.tsx          ✅ Premium redesign + delete + search
│   │   └── settings.tsx         ✅ Premium redesign
│   ├── results/
│   │   └── [scanId].tsx         ✅ Premium redesign + dietary flags
│   └── ingredient/
│       └── [ingredientId].tsx   ✅ Premium redesign
│
├── components/
│   ├── DietaryPreferencesModal.tsx  ✅
│   ├── ErrorBoundary.tsx            ✅
│   └── ui/                          ✅
│
├── constants/
│   └── theme.ts                 ✅ Full design system
│
├── lib/
│   ├── supabase.ts              ✅
│   ├── gemini.ts                ✅ personal_flag in prompt
│   └── emailValidator.ts        ✅ 300+ disposable domain blocklist
│
├── hooks/
│   ├── useScanner.ts            ✅
│   ├── useIngredientAnalysis.ts ✅ personal_flag saved
│   ├── useDietaryPreferences.ts ✅ onConflict fix
│   ├── useOnboarding.ts         ✅ (used by onboarding screen only)
│   └── useHistory.ts            ✅
│
└── store/
    └── index.ts                 ✅ Zustand auth store
```

### 9.5 Auth Flow ✅

```
App launch
    └─ Check Supabase session + AsyncStorage onboarding flag
         ├─ No session + first launch → /(auth)/onboarding
         ├─ No session + seen onboarding → /(auth)/welcome
         └─ Session exists → /(tabs)/home
```

### 9.6 Dietary Preferences Flow ✅

```
User sets preferences in DietaryPreferencesModal
    └─ Saved to dietary_preferences table (upsert with onConflict: 'user_id')
         └─ useScanner reads preferences → passes to saveAnalysis()
              └─ analyzeIngredients() includes preferences in Gemini prompt
                   └─ Gemini returns personal_flag per ingredient
                        └─ personal_flag saved to ingredients table
                             └─ Results screen: getPersonalFlag() checks personal_flag
                                  + local keyword fallback for cached ingredients
```

---

## 10. Data Models & Database Schema

### 10.1 `profiles` ✅

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  scan_count  integer default 0,
  created_at  timestamptz default now()
);
```

### 10.2 `scans` ✅

```sql
create table scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  label           text,
  raw_ocr_text    text,
  image_url       text,
  safety_score    integer,
  ingredient_ids  uuid[],
  created_at      timestamptz default now()
);
```

### 10.3 `ingredients` ✅ (with caching + personal_flag)

```sql
create table ingredients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  aliases         text[],
  category        text,
  description     text,
  safety_level    text check (safety_level in ('safe', 'caution', 'harmful', 'unknown')),
  health_concerns text[],
  country_status  jsonb,
  personal_flag   text default null,
  last_updated    timestamptz default now()
);
```

### 10.4 `dietary_preferences` ✅

```sql
create table dietary_preferences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade unique,
  conditions  text[] default '{}',
  allergies   text[] default '{}',
  diet_type   text default 'none',
  updated_at  timestamptz default now()
);

alter table dietary_preferences enable row level security;

create policy "Users can manage own dietary preferences"
  on dietary_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 10.5 `subscriptions` 🔲 Pending (Phase 4)

```sql
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade unique,
  revenuecat_user_id   text,
  plan                 text check (plan in ('free', 'pro')),
  status               text,
  expires_at           timestamptz,
  updated_at           timestamptz default now()
);
```

### 10.6 Supabase RPC Functions ✅

- `increment_scan_count(user_id)` — atomically increments scan count
- `delete_user_account(user_id)` — deletes user data and auth record

---

## 11. API Specifications

### 11.1 Gemini API ✅

**Model:** `gemini-2.5-flash`  
**Free tier:** 1,500 req/day  
**Caching:** Supabase `ingredients` table  
**Dietary context:** User preferences injected into prompt — returns `personal_flag` per ingredient

**Response schema per ingredient:**
```json
{
  "name": "Sodium Benzoate",
  "aliases": ["E211"],
  "category": "Preservative",
  "description": "...",
  "safety_level": "caution",
  "health_concerns": ["..."],
  "country_status": { "US": "permitted", "EU": "permitted_with_limits", ... },
  "personal_flag": "May trigger your sulphite allergy" | null
}
```

### 11.2 Email Validation — `lib/emailValidator.ts` ✅

1. Regex format check
2. IP address domain rejection
3. 300+ disposable/temp email domain blocklist
4. Subdomain variant check

Returns: `{ valid: true } | { valid: false; reason: string }`

---

## 12. Monetization Model

### 12.1 Tiers

| Feature | Free | Pro ($4.99/mo or $34.99/yr) |
|---|---|---|
| Scans per month | 5 | Unlimited |
| Basic ingredient definitions | ✅ | ✅ |
| Safety level | ✅ | ✅ |
| Full AI descriptions | ❌ Truncated | ✅ |
| Country ban data | ❌ Locked | ✅ |
| Health concerns list | ❌ Locked | ✅ |
| Dietary preference flagging | ✅ | ✅ |
| Scan history | Last 10 | Unlimited |
| PDF export | ❌ | ✅ Future |

### 12.2 Paywall Triggers 🔲
- Scan #6 in a month
- Tapping locked country data section
- Tapping truncated description
- Settings → Upgrade to Pro

### 12.3 RevenueCat 🔲
- `ingryn_pro_monthly` — $4.99/mo
- `ingryn_pro_annual` — $34.99/yr (~42% saving)
- Entitlement: `pro`

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Scan-to-results: < 10s (target < 7s)
- App launch: < 3s cold start
- OCR: < 2s
- Gemini response: < 5s (target < 3s)
- Cache hit: < 500ms
- History list: 60fps up to 500 records

### 13.2 Security
- All API keys in env variables
- Supabase RLS on all tables
- Client-side rate limiting on auth
- Disposable email blocking
- Account deletion via RPC

### 13.3 Privacy
- No third-party data selling
- GDPR-compliant full data deletion ✅
- No individual-identifying analytics

### 13.4 Accessibility
- Accessible labels on all interactive elements
- Minimum touch target: 44×44pt
- Safety level always shown as text + colour
- System font size scaling supported

### 13.5 App Store Requirements
- Camera permission string: "INGRYN needs camera access to scan ingredient labels"
- iOS minimum: iOS 15
- Android minimum: API 26 (Android 8.0)

---

## 14. Release Phases

### Phase 1 — Foundation ✅ Complete
Expo + Supabase setup, auth, tab navigation shell

### Phase 2 — Core Scanner ✅ Complete
Camera, OCR, Gemini integration, results + ingredient detail screens

### Phase 3 — Data & Auth Hardening ✅ Complete
Scan history, ingredient caching, inline errors, rate limiting, email validation, forgot password, dietary preferences

### Phase 3.5 — UI Overhaul ✅ Complete
- Full premium light theme across all 13 screens
- Design system (`constants/theme.ts`)
- Plus Jakarta Sans typography
- Phosphor icons replacing lucide-react-native
- LinearGradient CTAs and safety cards
- Onboarding routing fixed (AsyncStorage direct read)
- `signup.tsx` bug fixed (had signin code)
- `app/index.tsx` routing conflict removed
- `personal_flag` now saved to Supabase
- `dietary_preferences` upsert `onConflict` fix
- 117-ingredient seed dataset

### Phase 4 — Monetisation 🔲 Next
- RevenueCat SDK
- Paywall screen
- Free tier scan limit (5/month)
- Feature gating
- Subscription status in settings + restore purchases

### Phase 5 — Polish & Launch 🔲
- Google OAuth
- OCR text review/edit before analysis
- Error state hardening across all screens
- App Store + Play Store assets
- TestFlight / internal testing
- Submission

---

## 15. Open Questions & Risks

| # | Question / Risk | Status |
|---|---|---|
| 1 | Gemini free tier (1,500 req/day) — ingredient caching significantly reduces calls | ✅ Mitigated |
| 2 | ML Kit OCR accuracy on glossy/curved labels | 🔲 Test on physical device |
| 3 | Country ban data accuracy — Gemini has training cutoff | 🔲 Add disclaimer in UI |
| 4 | App Store approval — avoid medical claims in all copy | 🔲 Copy review needed |
| 5 | OCR garbled text — need confidence threshold < 50 chars | 🔲 Open |
| 6 | Gemini API called client-side — should move to Edge Function pre-launch | 🔲 Decision needed |
| 7 | Mixed-script labels (English + Hindi) — OCR behaviour untested | 🔲 Open |
| 8 | `--legacy-peer-deps` required for all installs | ✅ Documented |
| 9 | `personal_flag` on cached ingredients shows null until re-scan | 🔲 Local keyword fallback in place |

---

*End of PRD v2.1*  
*Update version and date on every significant change.*