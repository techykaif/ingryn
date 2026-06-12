# INGRYN — Product Requirements Document

**Version:** 2.0  
**Date:** June 2026  
**Status:** Active Development  
**Platform:** iOS + Android (React Native / Expo)  
**Last Updated:** June 2026 — Major revision reflecting completed implementation

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
| 2.0 | June 2026 | Major update reflecting completed Phase 1–3 implementation, auth hardening, ingredient caching, and revised remaining scope |

---

## 1. Executive Summary

INGRYN is a mobile-first SaaS application that allows users to scan product ingredient labels using their phone camera and instantly receive AI-powered analysis. The app identifies each ingredient, provides clear definitions, flags potentially harmful substances, and highlights ingredients that are banned or restricted in specific countries.

INGRYN is targeted at health-conscious consumers, parents, people with dietary restrictions, travellers, and anyone who wants to understand what is actually inside the products they buy — without needing a chemistry degree.

**Current status:** Core functionality is fully implemented and working end-to-end. Auth, scanning, AI analysis, ingredient caching, history, and settings are all live. Monetisation (Phase 4) is next.

---

## 2. Problem Statement

### The core problem
Modern consumer products contain dozens of synthetic compounds, preservatives, flavour enhancers, and chemical additives. The average person cannot interpret ingredient labels. Even informed consumers struggle to:

- Understand what individual chemical ingredients actually are
- Know which ingredients are considered harmful or controversial
- Know that an ingredient legal in their country may be banned elsewhere (e.g. Red 40, BHA, potassium bromate)
- Keep up with evolving food safety research

### Why existing solutions fall short
- **Google search**: Requires searching each ingredient one by one — time-consuming and returns inconsistent information
- **EWG / Think Dirty**: Limited product database, no camera OCR, no real-time AI analysis
- **Open Food Facts**: Crowdsourced, incomplete, no country-specific ban data
- **Yuka**: App-store incumbent but lacks depth of AI-powered per-ingredient explanations and country ban tracking

### The INGRYN opportunity
A single camera scan → instant, structured, AI-powered breakdown of every ingredient in under 10 seconds. No manual input. No product database dependency. Works on any label, any language.

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
- AI analysis covers 100% of detected ingredients (no blank/unknown results)
- App Store rating ≥ 4.3 stars

---

## 4. User Personas

### Persona 1 — The Health-Conscious Parent
**Name:** Priya, 34  
**Location:** Mumbai  
**Context:** Buys packaged food for her two kids and wants to avoid artificial colours and preservatives  
**Pain point:** Ingredient lists are long, technical, and impossible to parse while standing in a supermarket aisle  
**Goal:** Quickly know if a product is safe for her children  
**Key feature:** Harmful substance flag + quick safety score visible at a glance

### Persona 2 — The Traveller / Expat
**Name:** Marco, 28  
**Location:** Moves between EU and US  
**Context:** Knows that EU and US food regulations differ significantly  
**Pain point:** Can't tell if something he buys in the US would be banned back home in Italy  
**Goal:** Know exactly which ingredients are restricted or banned in which countries  
**Key feature:** Country-specific ban list per ingredient

### Persona 3 — The Fitness Enthusiast
**Name:** Aanya, 25  
**Location:** Delhi  
**Context:** Tracks macros and avoids certain additives that interfere with her training  
**Pain point:** Supplement and protein bar labels are packed with chemical names she doesn't recognise  
**Goal:** Understand every single ingredient in her supplements  
**Key feature:** Detailed per-ingredient definitions + categories (preservative, colouring, sweetener, etc.)

### Persona 4 — The Allergy Sufferer
**Name:** Rahul, 41  
**Location:** Bangalore  
**Context:** Has a sulphite sensitivity and his partner is lactose intolerant  
**Pain point:** Allergens hide under chemical names he doesn't know  
**Goal:** Instantly detect hidden allergens in any product  
**Key feature:** Allergen flagging + ingredient aliases (e.g. E220 = Sulphur Dioxide)

---

## 5. Competitive Landscape

| App | OCR Scan | AI Analysis | Country Bans | Allergen Detection | Subscription |
|---|---|---|---|---|---|
| **INGRYN** | ✅ | ✅ Gemini 2.5 Flash | ✅ | ✅ | ✅ Freemium |
| Yuka | ✅ | ❌ Static DB | ❌ | Partial | ✅ |
| Think Dirty | ❌ Manual | ❌ Static DB | ❌ | ❌ | ✅ |
| Open Food Facts | ❌ Barcode | ❌ Community | ❌ | Partial | Free |
| EWG Healthy Living | ❌ Barcode | ❌ Static DB | ❌ | ✅ | ✅ |

**INGRYN's differentiator:** The only app that combines camera OCR with real-time AI analysis and country-specific regulatory data — and works on any label regardless of barcode availability.

---

## 6. Product Scope

### Completed — v1.0 Core
- ✅ User authentication (email/password) with full error handling and rate limiting
- ✅ Forgot password flow (inline, no separate screen)
- ✅ Email validation with disposable/temp email domain blocklist (300+ domains)
- ✅ Auth guard preventing unauthenticated access to all app screens
- ✅ Camera-based ingredient label scanning
- ✅ Gallery image picker as fallback
- ✅ OCR text extraction
- ✅ AI-powered ingredient analysis via Gemini 2.5 Flash
- ✅ Per-ingredient definitions, safety ratings, and category tags
- ✅ Country ban / restriction flags (US, EU, UK, India, Australia, Canada, Japan, China)
- ✅ Ingredient caching in Supabase (same ingredient not re-analysed on repeat scans)
- ✅ Scan history saved to Supabase with full persistence
- ✅ History screen with chronological list
- ✅ Ingredient detail view
- ✅ Settings screen (edit name, change password, delete account)
- ✅ Session persistence across app restarts (AsyncStorage)
- ✅ Modular architecture — hooks separated from screen components

### In Progress / Next
- 🔲 Google OAuth
- 🔲 RevenueCat subscription integration
- 🔲 Paywall screen + feature gating
- 🔲 Free tier scan limit enforcement (5 scans/month)
- 🔲 Onboarding flow (3-step animated walkthrough)
- 🔲 Overall product safety score (0–100 ring)
- 🔲 Scan naming / labelling by user

### Out of Scope — v1.0 (future roadmap)
- Barcode scanning
- Personalised allergen profiles saved to account
- Social / sharing features
- Web app
- Offline mode
- Multi-language label OCR (non-Latin scripts)
- Nutritional analysis
- Product recommendations / alternatives
- PDF export of scan results

---

## 7. Feature Requirements

### 7.1 Authentication ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| AUTH-01 | User can create an account with email + password | P0 | ✅ Done |
| AUTH-02 | User can sign in with Google OAuth | P0 | 🔲 Pending |
| AUTH-03 | User can reset their password via email | P0 | ✅ Done |
| AUTH-04 | Session persists across app restarts | P0 | ✅ Done |
| AUTH-05 | User can sign out | P0 | ✅ Done |
| AUTH-06 | New users shown onboarding flow before home | P1 | 🔲 Pending |
| AUTH-07 | Returning users taken directly to home screen | P0 | ✅ Done |
| AUTH-08 | Inline error messages for all auth failure states | P0 | ✅ Done |
| AUTH-09 | Client-side rate limiting (5 attempts → lockout with exponential backoff) | P0 | ✅ Done |
| AUTH-10 | Disposable/temp email addresses blocked at registration and login | P0 | ✅ Done |
| AUTH-11 | User can edit their display name from settings | P1 | ✅ Done |
| AUTH-12 | User can change password from settings | P1 | ✅ Done |
| AUTH-13 | User can permanently delete their account | P1 | ✅ Done |

### 7.2 Scanner ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| SCAN-01 | App requests camera permission on first use | P0 | ✅ Done |
| SCAN-02 | Live camera viewfinder with crop guide overlay | P0 | ✅ Done |
| SCAN-03 | User taps capture button to photograph label | P0 | ✅ Done |
| SCAN-04 | OCR extracts text from captured image | P0 | ✅ Done |
| SCAN-05 | Extracted text parsed into ingredient list array | P0 | ✅ Done |
| SCAN-06 | User can review and edit extracted text before analysis | P1 | 🔲 Pending |
| SCAN-07 | Gallery image picker as fallback to camera | P1 | ✅ Done |
| SCAN-08 | Processing state shown during OCR + AI analysis | P0 | ✅ Done |
| SCAN-09 | Scan-to-result time under 10 seconds | P0 | ✅ Done |
| SCAN-10 | Free users limited to 5 scans per month | P1 | 🔲 Pending (Phase 4) |

### 7.3 AI Analysis ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| AI-01 | Gemini 2.5 Flash receives ingredient list and returns structured JSON | P0 | ✅ Done |
| AI-02 | Each ingredient includes: name, aliases, category, description, safety level, country bans | P0 | ✅ Done |
| AI-03 | Country ban data covers: US, EU, UK, India, Australia, Canada, Japan, China | P0 | ✅ Done |
| AI-04 | Unknown ingredients flagged as "unverified" rather than silently failing | P0 | ✅ Done |
| AI-05 | Results cached in Supabase — same ingredient not re-analysed on repeat scans | P1 | ✅ Done |
| AI-06 | Prompt returns only valid JSON — no prose preamble | P0 | ✅ Done |

### 7.4 Results Screen ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| RES-01 | Results grouped by safety level: Harmful → Caution → Safe | P0 | ✅ Done |
| RES-02 | Each ingredient card: name, category tag, safety badge, 1-line summary | P0 | ✅ Done |
| RES-03 | Tapping ingredient opens ingredient detail view | P0 | ✅ Done |
| RES-04 | Overall product safety score (0–100) at top of results | P1 | 🔲 Pending |
| RES-05 | Country ban section showing restriction summary | P1 | 🔲 Pending |
| RES-06 | Scan result auto-saved to user's history | P0 | ✅ Done |
| RES-07 | User can name/label the scan | P1 | 🔲 Pending |

### 7.5 Ingredient Detail ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| DET-01 | Full ingredient name + all known aliases / E-numbers | P0 | ✅ Done |
| DET-02 | Category (e.g. Preservative, Artificial Colour, Emulsifier) | P0 | ✅ Done |
| DET-03 | Full description (3–5 sentences from AI) | P0 | ✅ Done |
| DET-04 | Safety level with explanation | P0 | ✅ Done |
| DET-05 | Country-by-country breakdown: Banned / Restricted / Permitted / Under Review | P0 | ✅ Done |
| DET-06 | Known health concerns as bullet list | P1 | ✅ Done |
| DET-07 | Common products this ingredient appears in | P2 | 🔲 Future |

### 7.6 History ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| HIS-01 | Chronological list of all past scans | P0 | ✅ Done |
| HIS-02 | Each item: scan name, date, safety score, top flagged ingredient | P0 | ✅ Done |
| HIS-03 | Tapping history item reopens full results screen | P0 | ✅ Done |
| HIS-04 | User can delete a scan from history | P1 | 🔲 Pending |
| HIS-05 | History synced to Supabase, persists across devices | P0 | ✅ Done |

### 7.7 Settings ✅ Completed

| ID | Requirement | Priority | Status |
|---|---|---|---|
| SET-01 | User can view their name and email | P0 | ✅ Done |
| SET-02 | User can edit their display name | P1 | ✅ Done |
| SET-03 | User can change their password | P1 | ✅ Done |
| SET-04 | User can delete their account (via Supabase RPC) | P1 | ✅ Done |
| SET-05 | Subscription status display + upgrade CTA | P0 | 🔲 Pending (Phase 4) |
| SET-06 | Restore purchases | P0 | 🔲 Pending (Phase 4) |
| SET-07 | Privacy policy / Terms of service links | P1 | 🔲 Pending |
| SET-08 | App version display | P2 | 🔲 Pending |

### 7.8 Subscription & Paywall 🔲 Next Phase

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PAY-01 | Free tier: 5 scans/month, basic ingredient info, no country ban data | P0 | 🔲 Pending |
| PAY-02 | Pro tier: unlimited scans, full country data, detailed AI descriptions | P0 | 🔲 Pending |
| PAY-03 | Paywall appears when free user hits limit or accesses Pro feature | P0 | 🔲 Pending |
| PAY-04 | RevenueCat handles all subscription logic (iOS + Android unified) | P0 | 🔲 Pending |
| PAY-05 | Subscription state synced to Supabase for server-side enforcement | P1 | 🔲 Pending |
| PAY-06 | Restore purchases available in settings | P0 | 🔲 Pending |

---

## 8. Screen Specifications

### 8.1 Welcome ✅ Implemented
**Route:** `/(auth)/welcome`

Value proposition screen shown to unauthenticated users. Leads to sign-up or sign-in. Bypassed automatically if session exists.

---

### 8.2 Sign In ✅ Implemented
**Route:** `/(auth)/signin`

**Implemented features:**
- Email + password fields with inline error banners (no Alert.alert — fixed for web compatibility)
- Input borders turn red on error, clear on retype
- Human-readable error messages mapped from Supabase error codes (invalid credentials, unconfirmed email, user not found, rate limit, network error)
- Client-side rate limiting: 5 failed attempts → 30s lockout, exponential backoff on repeat lockouts
- Live countdown timer shown in lockout banner
- Forgot password flow — inline (no separate screen), pre-fills email from sign-in field
- Forgot password success state with ✓ icon, resend option, back to sign in
- Email validated against format rules + 300+ disposable domain blocklist before Supabase call
- Password visibility toggle
- Google OAuth button (UI present, integration pending)

---

### 8.3 Sign Up ✅ Implemented
**Route:** `/(auth)/signup`

**Implemented features:**
- Full name, email, password fields
- Inline error banners (no Alert.alert)
- Email validated against format rules + disposable domain blocklist
- Password strength indicator (Weak / Fair / Strong with colour-coded bars)
- Mapped Supabase error messages (already registered, password too short, rate limit)
- Password visibility toggle
- Google OAuth button (UI present, integration pending)

---

### 8.4 Home ✅ Implemented
**Route:** `/(tabs)/home`

Command centre with greeting, primary scan CTA, and recent scans section. Links to full history.

---

### 8.5 Scanner ✅ Implemented
**Route:** `/(tabs)/scanner`

**Architecture (modular):**
- `hooks/useScanner.ts` — camera permission, capture, gallery picker, OCR logic
- `hooks/useIngredientAnalysis.ts` — Gemini API call + Supabase save logic
- `lib/gemini.ts` — API wrapper and prompt builder

Full-screen camera with crop guide overlay, capture button, gallery fallback, flash toggle. Processing state shown during OCR + AI analysis.

---

### 8.6 Results ✅ Implemented
**Route:** `/results/[scanId]`

Ingredients grouped by safety level (Harmful → Caution → Safe). Each card shows name, category tag, safety badge, 1-line summary. Tap to open ingredient detail. Auto-saved to history.

**Pending:** Overall safety score ring, country ban summary banner, scan naming.

---

### 8.7 Ingredient Detail ✅ Implemented
**Route:** `/ingredient/[ingredientId]`

Full name, aliases/E-numbers, category chip, safety badge, full AI description, health concerns bullet list, country-by-country status table with flag emojis.

---

### 8.8 History ✅ Implemented
**Route:** `/(tabs)/history`

Chronological scan list with product name, date, safety score, top flagged ingredient. Tapping reopens full results screen. Synced to Supabase.

**Pending:** Search/filter bar, delete scan.

---

### 8.9 Settings ✅ Implemented
**Route:** `/(tabs)/settings`

Edit display name, change password, delete account (Supabase RPC). 

**Pending:** Subscription status, restore purchases, privacy policy links, app version.

---

### 8.10 Paywall 🔲 Pending
**Route:** `/paywall` (modal)

To be implemented in Phase 4 with RevenueCat. Triggered when free user hits scan limit or taps a locked Pro feature.

---

### 8.11 Onboarding 🔲 Pending
**Route:** `/(auth)/onboarding`

3-step animated walkthrough shown to new users after first sign-up. Explains scan → analyse → know value prop. One-time only, skipped on subsequent sessions.

---

## 9. Technical Architecture

### 9.1 Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | Expo (React Native) SDK 56 | ✅ Implemented |
| Navigation | Expo Router (file-based) | ✅ Implemented |
| Auth | Supabase Auth | ✅ Implemented |
| Database | Supabase (PostgreSQL) | ✅ Implemented |
| OCR | Expo Camera + Image Picker | ✅ Implemented |
| AI Analysis | Google Gemini 2.5 Flash API | ✅ Implemented |
| Ingredient Cache | Supabase `ingredients` table | ✅ Implemented |
| Subscriptions | RevenueCat | 🔲 Pending |
| State Management | React hooks (useState, useRef) | ✅ Implemented |
| Session Storage | AsyncStorage | ✅ Implemented |
| Email Validation | Custom lib/emailValidator.ts | ✅ Implemented |

### 9.2 Key Technical Decisions & Resolved Issues

| Decision / Issue | Resolution |
|---|---|
| `@react-navigation/native` incompatible with Expo Router SDK 56 | Replaced with `useFocusEffect` from `expo-router` throughout |
| `Alert.alert` unreliable on web (silent failures) | Replaced with inline error state rendered in UI across all auth screens |
| Gemini 404/429 errors | Resolved by switching to `gemini-2.5-flash` model string with fresh API key |
| `MediaTypeOptions` deprecated in expo-image-picker | Replaced with `MediaType` API |
| `lucide-react-native` prop type issues | Added `react-native-svg` as peer dependency |
| `react-dom` version mismatch | Resolved via `--legacy-peer-deps` (standing requirement for all installs) |
| Monolithic file sizes | Modular architecture enforced — scanner split into `useScanner.ts` + `useIngredientAnalysis.ts` + `gemini.ts` |
| npm dependency conflicts | All `npm install` commands use `--legacy-peer-deps` — standing project requirement |

### 9.3 Project Folder Structure

```
ingryn/
├── app/
│   ├── (auth)/
│   │   ├── welcome.tsx          ✅
│   │   ├── signin.tsx           ✅
│   │   └── signup.tsx           ✅
│   ├── (tabs)/
│   │   ├── _layout.tsx          ✅
│   │   ├── home.tsx             ✅
│   │   ├── scanner.tsx          ✅
│   │   ├── history.tsx          ✅
│   │   └── settings.tsx         ✅
│   ├── results/
│   │   └── [scanId].tsx         ✅
│   ├── ingredient/
│   │   └── [ingredientId].tsx   ✅
│   └── _layout.tsx              ✅ (auth guard, gestureEnabled: false)
│
├── components/
│   ├── ui/                      ✅ Reusable primitives
│   ├── scanner/                 ✅
│   ├── results/                 ✅
│   └── history/                 ✅
│
├── lib/
│   ├── supabase.ts              ✅ (AsyncStorage session persistence)
│   ├── gemini.ts                ✅ (API wrapper + prompt builder)
│   ├── emailValidator.ts        ✅ (format + 300+ disposable domain blocklist)
│   └── utils.ts                 ✅
│
├── hooks/
│   ├── useScanner.ts            ✅ (camera/OCR/gallery logic)
│   ├── useIngredientAnalysis.ts ✅ (Gemini + Supabase save)
│   └── useHistory.ts            ✅
│
└── assets/
    ├── images/                  ✅ (generated via Python Pillow)
    └── fonts/
```

### 9.4 Auth Flow ✅ Implemented

```
App launch
    └─ Check Supabase session (AsyncStorage)
         ├─ No session → (auth)/welcome
         │       └─ Sign up / Sign in
         │               ├─ Client: format + disposable email check
         │               ├─ Client: rate limit check (5 attempts, exponential backoff)
         │               └─ Supabase Auth (email/password)
         │                       └─ Session created → (tabs)/home (router.replace)
         └─ Session exists → (tabs)/home (router.replace, gestureEnabled: false)
```

### 9.5 Scan Flow ✅ Implemented

```
User taps "Scan Ingredients"
    └─ Camera opens (useScanner.ts)
         └─ User captures photo (or picks from gallery)
              └─ OCR extracts text from image
                   └─ Text parsed → ingredient list array
                        └─ For each ingredient:
                             ├─ Check Supabase ingredients cache
                             │    ├─ Cache hit → use cached result
                             │    └─ Cache miss → call Gemini 2.5 Flash API
                             │                        └─ Save result to cache
                             └─ Results saved to scans table
                                  └─ Navigate to /results/[scanId]
```

---

## 10. Data Models & Database Schema

### 10.1 `profiles` ✅ Implemented

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  scan_count  integer default 0,
  created_at  timestamptz default now()
);
```

### 10.2 `scans` ✅ Implemented

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

### 10.3 `ingredients` ✅ Implemented (with caching)

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
  last_updated    timestamptz default now()
);
```

**Caching behaviour:** Before calling Gemini, the app queries this table by normalised ingredient name. On cache hit, the stored result is used directly. On cache miss, Gemini is called and the result is written back for future use.

### 10.4 `subscriptions` 🔲 Pending (Phase 4)

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

### 10.5 Supabase RPC Functions ✅ Implemented

- `increment_scan_count(user_id)` — atomically increments scan count on profiles
- `delete_user_account(user_id)` — deletes user data and auth record (used by settings screen)

---

## 11. API Specifications

### 11.1 Gemini API — Ingredient Analysis ✅ Implemented

**Model:** `gemini-2.5-flash`  
**Free tier:** 1,500 requests/day via Google AI Studio  
**Caching:** Supabase `ingredients` table eliminates redundant calls for previously seen ingredients

**System prompt:**
```
You are an ingredient safety expert and food scientist. You will be given a list of product ingredients. For each ingredient, return a JSON array. Return ONLY valid JSON — no preamble, no markdown, no explanation. Your response must start with [ and end with ].
```

**Expected JSON response per ingredient:**
```json
{
  "name": "Sodium Benzoate",
  "aliases": ["E211", "benzoate of soda"],
  "category": "Preservative",
  "description": "A synthetic preservative used to prevent mould and bacteria in acidic foods and beverages.",
  "safety_level": "caution",
  "health_concerns": [
    "Can form benzene when combined with ascorbic acid",
    "Linked to hyperactivity in children in some studies"
  ],
  "country_status": {
    "US": "permitted",
    "EU": "permitted_with_limits",
    "UK": "permitted_with_limits",
    "India": "permitted",
    "Australia": "permitted",
    "Canada": "permitted",
    "Japan": "banned",
    "China": "permitted"
  }
}
```

**Country status values:** `"permitted"` `"permitted_with_limits"` `"banned"` `"under_review"` `"no_data"`

### 11.2 Email Validation — `lib/emailValidator.ts` ✅ Implemented

Client-side validation applied before any Supabase auth call.

**Checks performed:**
1. Regex format validation (`/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/`)
2. IP address domain rejection
3. Must contain at least one dot in domain
4. Domain checked against 300+ known disposable/temp email services (Mailinator, YOPmail, Guerrilla Mail, 10minutemail, Temp-Mail, etc.)
5. Subdomain variants checked (e.g. `user@sub.mailinator.com` also blocked)

**Return type:** `{ valid: true } | { valid: false; reason: string }`

Applied in: `signin.tsx` (sign in + forgot password), `signup.tsx`

---

## 12. Monetization Model

### 12.1 Tiers

| Feature | Free | Pro ($4.99/month or $34.99/year) |
|---|---|---|
| Scans per month | 5 | Unlimited |
| Basic ingredient definitions | ✅ | ✅ |
| Safety level (Safe/Caution/Harmful) | ✅ | ✅ |
| Full AI descriptions | ❌ Truncated | ✅ |
| Country ban data | ❌ Locked | ✅ |
| Health concerns list | ❌ Locked | ✅ |
| Scan history saved | Last 10 | Unlimited |
| Export scan results (PDF) | ❌ | ✅ Future |

### 12.2 Paywall Trigger Points 🔲 Pending
- When free user attempts scan #6 in a month
- When free user taps "Country ban data" section (blurred/locked)
- When free user taps "Full description" (truncated with upgrade prompt)
- Settings → "Upgrade to Pro"

### 12.3 RevenueCat Configuration 🔲 Pending
- Product IDs: `ingryn_pro_monthly` ($4.99/mo), `ingryn_pro_annual` ($34.99/yr, ~42% saving)
- Entitlement: `pro`

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Scan-to-results time: < 10 seconds (target < 7s on mid-range device)
- App launch to home screen: < 3 seconds cold start
- OCR processing: < 2 seconds
- Gemini API response: < 5 seconds (target < 3s)
- Cache hit: < 500ms (no Gemini call)
- History list: 60 fps for up to 500 records

### 13.2 Reliability
- Gemini API failure: user-friendly error + "Try again" button, OCR text preserved
- Network failure: retry with exponential backoff (3 attempts)
- Supabase downtime: cached scans viewable offline

### 13.3 Security
- All API keys in environment variables, never in source control
- Supabase Row Level Security (RLS) on all tables
- JWT tokens validated on every authenticated request
- Client-side rate limiting on auth (5 attempts → exponential backoff lockout)
- Disposable email addresses blocked at registration
- Account deletion via Supabase RPC (not client-side delete)

### 13.4 Privacy
- No selling of user scan data to third parties
- Scan images in private Supabase Storage bucket
- GDPR-compliant: full account + data deletion available from settings ✅
- No individual-identifying analytics

### 13.5 Accessibility
- All interactive elements have accessible labels
- Minimum touch target: 44×44pt
- Safety level always shown as text + colour (never colour alone)
- Supports system font size scaling

### 13.6 App Store Requirements
- Camera permission: "INGRYN needs camera access to scan ingredient labels"
- iOS minimum: iOS 15
- Android minimum: API 26 (Android 8.0)

---

## 14. Release Phases

### Phase 1 — Foundation ✅ Complete
- Expo + Expo Router + Supabase setup
- Email/password auth with session persistence
- Tab navigation shell
- Home, History, Settings screens

### Phase 2 — Core Scanner ✅ Complete
- Camera + image picker
- OCR text extraction
- Gemini 2.5 Flash integration + prompt engineering
- Results screen (full ingredient breakdown)
- Ingredient detail screen

### Phase 3 — Data Persistence ✅ Complete
- Scan history saved to Supabase
- Ingredient caching (avoid redundant Gemini calls)
- Auth hardening: inline errors, rate limiting, disposable email blocking, forgot password

### Phase 4 — Monetisation 🔲 Next
- RevenueCat SDK integration
- Paywall screen
- Free tier scan limit enforcement (5/month)
- Feature gating (country data, full descriptions, history limit)
- Subscription status in settings + restore purchases

### Phase 5 — Polish & Launch 🔲 Upcoming
- Onboarding flow (3-step animated walkthrough for new users)
- Overall safety score ring on results screen
- Scan naming by user
- History search + delete
- Error states + edge case hardening
- Performance optimisation
- App Store + Play Store assets
- TestFlight / internal testing
- Submission

---

## 15. Open Questions & Risks

| # | Question / Risk | Status |
|---|---|---|
| 1 | Gemini free tier (1,500 req/day). Ingredient caching significantly reduces API calls — same ingredient across many users hits cache. | ✅ Mitigated via caching |
| 2 | ML Kit OCR accuracy on non-standard labels (glossy, small print, curved surfaces) | 🔲 To test on physical devices |
| 3 | Country ban data accuracy — Gemini training data has a cutoff. High-confidence ban claims may need manual verification layer. | 🔲 Open — add disclaimer in UI |
| 4 | App Store approval risk: ingredient analysis apps have been rejected for medical claims. All copy must be framed as informational, not medical advice. | 🔲 Mitigation needed in copy review |
| 5 | OCR garbled text — need a confidence threshold: if extracted text is < 50 characters or has no recognisable ingredient patterns, prompt user to retake. | 🔲 Open |
| 6 | Gemini API called client-side currently. For production, should move to Supabase Edge Function to hide API key. | 🔲 Pre-launch decision needed |
| 7 | Mixed-script labels (English + Hindi on Indian products) — OCR and analysis behaviour untested. | 🔲 Open |
| 8 | `--legacy-peer-deps` required for all npm installs due to dependency conflicts. Must be documented for any new contributor. | ✅ Documented |

---

*End of PRD v2.0*

*This is a living document. Update version number and date on every significant change.*