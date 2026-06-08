# INGRYN — Product Requirements Document

**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft  
**Platform:** iOS + Android (React Native / Expo)

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

## 1. Executive Summary

INGRYN is a mobile-first SaaS application that allows users to scan product ingredient labels using their phone camera and instantly receive AI-powered analysis. The app identifies each ingredient, provides clear definitions, flags potentially harmful substances, and highlights ingredients that are banned or restricted in specific countries.

INGRYN is targeted at health-conscious consumers, parents, people with dietary restrictions, travellers, and anyone who wants to understand what is actually inside the products they buy — without needing a chemistry degree.

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
| **INGRYN** | ✅ | ✅ Claude API | ✅ | ✅ | ✅ Freemium |
| Yuka | ✅ | ❌ Static DB | ❌ | Partial | ✅ |
| Think Dirty | ❌ Manual | ❌ Static DB | ❌ | ❌ | ✅ |
| Open Food Facts | ❌ Barcode | ❌ Community | ❌ | Partial | Free |
| EWG Healthy Living | ❌ Barcode | ❌ Static DB | ❌ | ✅ | ✅ |

**INGRYN's differentiator:** The only app that combines camera OCR with real-time AI analysis and country-specific regulatory data — and works on any label regardless of barcode availability.

---

## 6. Product Scope

### In Scope — v1.0
- User authentication (email/password + Google OAuth)
- Camera-based ingredient label scanning
- OCR text extraction via ML Kit
- AI-powered ingredient analysis via Claude API
- Per-ingredient definitions, safety ratings, and category tags
- Country ban / restriction flags (initial list: US, EU, UK, India, Australia, Canada, Japan, China)
- Scan history with saved results
- Ingredient detail view
- Freemium model with scan limits
- iOS + Android

### Out of Scope — v1.0 (future roadmap)
- Barcode scanning
- Personalised profiles (allergen preferences saved)
- Social/sharing features
- Web app
- Offline mode
- Multi-language label OCR (non-Latin scripts)
- Nutritional analysis
- Product recommendations / alternatives

---

## 7. Feature Requirements

### 7.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | User can create an account with email + password | P0 |
| AUTH-02 | User can sign in with Google OAuth | P0 |
| AUTH-03 | User can reset their password via email | P0 |
| AUTH-04 | Session persists across app restarts | P0 |
| AUTH-05 | User can sign out | P0 |
| AUTH-06 | New users are shown an onboarding flow before reaching the home screen | P1 |
| AUTH-07 | Returning users are taken directly to the home screen | P0 |

### 7.2 Scanner

| ID | Requirement | Priority |
|---|---|---|
| SCAN-01 | App requests camera permission on first use with clear explanation | P0 |
| SCAN-02 | Live camera viewfinder with ingredient-area crop guide overlay | P0 |
| SCAN-03 | User taps capture button to take a photo of the ingredient label | P0 |
| SCAN-04 | ML Kit OCR extracts text from captured image | P0 |
| SCAN-05 | Extracted text is cleaned and parsed into an ingredient list | P0 |
| SCAN-06 | User can review and edit extracted text before analysis | P1 |
| SCAN-07 | Manual text entry fallback if camera scan fails | P1 |
| SCAN-08 | Processing state shown with progress indicator during OCR + AI analysis | P0 |
| SCAN-09 | Full scan-to-result time must be under 10 seconds on mid-range hardware | P0 |
| SCAN-10 | Free users are limited to 5 scans per month | P1 |

### 7.3 AI Analysis

| ID | Requirement | Priority |
|---|---|---|
| AI-01 | Gemini 2.5 Flash API receives the parsed ingredient list and returns structured JSON | P0 |
| AI-02 | Each ingredient response includes: name, common aliases, category, short description (1–2 sentences), safety level (safe / caution / harmful), and country ban list | P0 |
| AI-03 | Country ban data covers: US, EU, UK, India, Australia, Canada, Japan, China | P0 |
| AI-04 | If an ingredient is unknown or unrecognisable, the response flags it as "unverified" rather than silently failing | P0 |
| AI-05 | Results are cached in Supabase so the same ingredient is not re-analysed on subsequent scans | P1 |
| AI-06 | Prompt is structured to return only valid JSON — no prose preamble | P0 |

### 7.4 Results Screen

| ID | Requirement | Priority |
|---|---|---|
| RES-01 | Results are grouped by safety level: Harmful → Caution → Safe | P0 |
| RES-02 | Each ingredient card shows: name, category tag, safety badge (colour-coded), and 1-line summary | P0 |
| RES-03 | Tapping an ingredient opens the ingredient detail view | P0 |
| RES-04 | An overall product safety score (0–100) is shown at the top of the results screen | P1 |
| RES-05 | Country ban section shows a world map view or country list of where ingredients are restricted | P1 |
| RES-06 | Scan result is auto-saved to the user's history | P0 |
| RES-07 | User can name/label the scan (e.g. "Lays Classic") | P1 |

### 7.5 Ingredient Detail

| ID | Requirement | Priority |
|---|---|---|
| DET-01 | Shows full ingredient name + all known aliases / E-numbers | P0 |
| DET-02 | Shows category (e.g. Preservative, Artificial Colour, Emulsifier) | P0 |
| DET-03 | Shows full description (3–5 sentences from AI) | P0 |
| DET-04 | Shows safety level with explanation | P0 |
| DET-05 | Shows a country-by-country breakdown: Banned / Restricted / Permitted / Under Review | P0 |
| DET-06 | Shows known health concerns (if any) as bullet points | P1 |
| DET-07 | Shows common products this ingredient appears in | P2 |

### 7.6 History

| ID | Requirement | Priority |
|---|---|---|
| HIS-01 | Displays chronological list of all past scans | P0 |
| HIS-02 | Each history item shows: scan name/label, date, overall safety score, thumbnail of top flagged ingredient | P0 |
| HIS-03 | Tapping a history item reopens the full results screen | P0 |
| HIS-04 | User can delete a scan from history | P1 |
| HIS-05 | History is synced to Supabase and persists across devices | P0 |

### 7.7 Subscription & Paywall

| ID | Requirement | Priority |
|---|---|---|
| PAY-01 | Free tier: 5 scans/month, basic ingredient info, no country ban data | P0 |
| PAY-02 | Pro tier: unlimited scans, full country ban data, detailed AI descriptions, export history | P0 |
| PAY-03 | Paywall appears when free user hits scan limit or tries to access a Pro feature | P0 |
| PAY-04 | RevenueCat handles all subscription logic (iOS + Android unified) | P0 |
| PAY-05 | Subscription state is synced to Supabase for server-side enforcement | P1 |
| PAY-06 | Restore purchases flow available in settings | P0 |

---

## 8. Screen Specifications

### 8.1 Onboarding / Welcome
**Route:** `/(auth)/welcome`

**Purpose:** First impression. Explains value proposition, leads to sign-up.

**Elements:**
- INGRYN logo + tagline: *"Know what's inside."*
- 3-step animated feature highlights (scan → analyse → know)
- "Create account" CTA (primary)
- "Sign in" CTA (secondary)
- Google OAuth button

**Behaviour:**
- Only shown to users who are not authenticated
- Skips directly to `/(tabs)/home` if session exists

---

### 8.2 Sign Up / Sign In
**Route:** `/(auth)/signup`, `/(auth)/signin`

**Elements:**
- Email + password fields
- Google OAuth button
- Password visibility toggle
- Error states for invalid credentials
- Link to reset password

---

### 8.3 Home
**Route:** `/(tabs)/home`

**Purpose:** Command centre. Recent scans + primary scan CTA.

**Elements:**
- Greeting with user's first name
- Large "Scan Ingredients" button (prominent, centred)
- "Recent scans" section — last 3 scans as cards
- "View all history" link
- Free tier: scan counter (e.g. "3 of 5 scans used")
- Pro badge if subscribed

**Behaviour:**
- Tapping "Scan Ingredients" navigates to scanner screen
- Tapping a recent scan card navigates to its results screen

---

### 8.4 Scanner
**Route:** `/(tabs)/scanner`

**Purpose:** Capture the ingredient label.

**Elements:**
- Full-screen camera viewfinder
- Rectangular crop guide overlay labelled "Point at ingredient list"
- Capture button (large, centred bottom)
- Flash toggle
- Manual entry fallback button ("Type ingredients instead")
- Cancel button (top left)

**States:**
1. **Idle** — live camera feed with crop guide
2. **Captured** — still image shown, "Analysing…" spinner
3. **OCR complete** — brief confirmation, transitions automatically to loading state
4. **Error** — "Couldn't read label. Try better lighting or manual entry."

---

### 8.5 Processing / Loading
**Route:** Modal / overlay on scanner

**Purpose:** Keep the user engaged during the 5–10 second analysis.

**Elements:**
- Animated ingredient name cycling (fun micro-copy like "Identifying Sodium Benzoate…")
- Progress bar or pulsing animation
- "Did you know?" tip about an ingredient

---

### 8.6 Results
**Route:** `/results/[scanId]`

**Purpose:** Full ingredient breakdown for a single scan.

**Layout (top to bottom):**
- Product name (editable, defaults to date/time)
- Overall safety score (large number, colour-coded ring)
- Country ban summary (e.g. "2 ingredients banned in EU")
- Ingredient list grouped by safety: Harmful (red) → Caution (amber) → Safe (green)
- Each ingredient card: name, category tag, safety badge, 1-line description
- "Save scan" button if not yet saved

**Interactions:**
- Tap ingredient card → ingredient detail screen
- Tap country ban summary → country ban breakdown screen
- Share button (Pro feature)

---

### 8.7 Ingredient Detail
**Route:** `/ingredient/[ingredientId]`

**Purpose:** Deep dive on a single ingredient.

**Layout:**
- Ingredient name (large, bold)
- Aliases / E-number (subtitle)
- Category chip (e.g. "Artificial Preservative")
- Safety badge (Harmful / Caution / Safe)
- Full description (3–5 sentences)
- Health concerns section (bullet list, if any)
- Country status table:
  ```
  🇺🇸 United States     Permitted
  🇪🇺 European Union    Banned since 2019
  🇬🇧 United Kingdom    Restricted (max 0.1%)
  🇮🇳 India             Permitted
  🇦🇺 Australia         Banned
  🇨🇦 Canada            Under Review
  🇯🇵 Japan             Permitted
  🇨🇳 China             Banned
  ```
- Back button to results screen

---

### 8.8 History
**Route:** `/(tabs)/history`

**Purpose:** All past scans.

**Layout:**
- Search bar (filter by product name or ingredient)
- Chronological list of scan cards
  - Each card: product name, date, safety score badge, ingredient count, top harmful ingredient name
- Empty state: "No scans yet. Tap the scanner to get started."

---

### 8.9 Settings / Profile
**Route:** `/(tabs)/settings`

**Elements:**
- User avatar + name + email
- Subscription status + "Upgrade to Pro" or "Manage subscription"
- Restore purchases
- Scan limit counter (free users)
- Sign out
- Privacy policy / Terms of service links
- App version

---

## 9. Technical Architecture

### 9.1 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Expo (React Native) | Cross-platform iOS + Android, familiar JS ecosystem |
| Navigation | Expo Router (file-based) | Clean, Next.js-style routing |
| Auth | Supabase Auth | Free tier, Google OAuth built-in, JWT sessions |
| Database | Supabase (PostgreSQL) | Pairs with auth, free tier, real-time capable |
| OCR | Google ML Kit (on-device) | Fast, free, works offline, no API cost |
| AI Analysis | Google Gemini 2.5 Flash API | Excellent structured JSON output, 1,500 free req/day, existing API key |
| Subscriptions | RevenueCat | Unified iOS/Android subscription management |
| State Management | Zustand | Lightweight, no boilerplate |
| Styling | NativeWind (Tailwind for RN) | Rapid UI development |

### 9.2 Project Folder Structure

```
ingryn/
├── app/
│   ├── (auth)/
│   │   ├── welcome.tsx
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── home.tsx
│   │   ├── scanner.tsx
│   │   ├── history.tsx
│   │   └── settings.tsx
│   ├── results/
│   │   └── [scanId].tsx
│   ├── ingredient/
│   │   └── [ingredientId].tsx
│   └── _layout.tsx              # Root layout, auth guard
│
├── components/
│   ├── ui/                      # Reusable primitives (Button, Card, Badge, etc.)
│   ├── scanner/                 # Camera, OCR components
│   ├── results/                 # Ingredient card, safety score ring, etc.
│   └── history/                 # Scan history card
│
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── gemini.ts                # Gemini API wrapper + prompt builder
│   ├── ocr.ts                   # ML Kit OCR wrapper
│   ├── revenuecat.ts            # RevenueCat wrapper
│   └── utils.ts                 # Shared helpers
│
├── hooks/
│   ├── useAuth.ts               # Auth state + methods
│   ├── useScan.ts               # Scan flow logic
│   ├── useSubscription.ts       # Subscription state
│   └── useHistory.ts            # History fetch + mutations
│
├── store/
│   └── index.ts                 # Zustand global store
│
├── constants/
│   ├── countries.ts             # Country list + flags
│   └── theme.ts                 # Design tokens
│
└── assets/
    ├── images/
    └── fonts/
```

### 9.3 Auth Flow

```
App launch
    └─ Check Supabase session
         ├─ No session → (auth)/welcome
         │       └─ Sign up / Sign in
         │               └─ Supabase Auth (email or Google OAuth)
         │                       └─ Session created → (tabs)/home
         └─ Session exists → (tabs)/home
```

### 9.4 Scan Flow

```
User taps "Scan Ingredients"
    └─ Camera opens
         └─ User captures photo
              └─ ML Kit OCR → raw text extracted
                   └─ Text parsed → ingredient list array
                        └─ Claude API called with ingredient list
                             └─ Structured JSON returned
                                  └─ Results saved to Supabase (scans table)
                                       └─ Navigate to /results/[scanId]
```

---

## 10. Data Models & Database Schema

### 10.1 `users` (managed by Supabase Auth, extended via profiles)

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  scan_count  integer default 0,
  created_at  timestamptz default now()
);
```

### 10.2 `scans`

```sql
create table scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  label           text,                          -- user-given name, e.g. "Lays Classic"
  raw_ocr_text    text,                          -- raw text extracted from image
  image_url       text,                          -- stored in Supabase Storage
  safety_score    integer,                       -- 0-100 overall score
  ingredient_ids  uuid[],                        -- array of ingredient ids
  created_at      timestamptz default now()
);
```

### 10.3 `ingredients` (cached AI analysis results)

```sql
create table ingredients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,           -- normalised lowercase name
  aliases         text[],                         -- e.g. ["e211", "sodium benzoate"]
  category        text,                           -- e.g. "Preservative"
  description     text,
  safety_level    text check (safety_level in ('safe', 'caution', 'harmful', 'unknown')),
  health_concerns text[],
  country_status  jsonb,                          -- { "US": "permitted", "EU": "banned", ... }
  last_updated    timestamptz default now()
);
```

### 10.4 `subscriptions`

```sql
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade unique,
  revenuecat_user_id   text,
  plan                 text check (plan in ('free', 'pro')),
  status               text,                      -- active, expired, cancelled
  expires_at           timestamptz,
  updated_at           timestamptz default now()
);
```

---

## 11. API Specifications

### 11.1 Gemini API — Ingredient Analysis

**Model:** `gemini-2.5-flash`  
**Free tier:** 1,500 requests/day via Google AI Studio API key  
**Fallback strategy:** Retry once with exponential backoff on failure. Upgrade to `gemini-2.5-pro` when scaling.

**System prompt:**
```
You are an ingredient safety expert and food scientist. You will be given a list of product ingredients. For each ingredient, return a JSON array. Return ONLY valid JSON — no preamble, no markdown, no explanation. Your response must start with [ and end with ].
```

**User message format:**
```
Analyse these ingredients: Sodium Benzoate, Yellow 5, High Fructose Corn Syrup, Citric Acid, Natural Flavors
```

**Expected JSON response:**
```json
[
  {
    "name": "Sodium Benzoate",
    "aliases": ["E211", "benzoate of soda"],
    "category": "Preservative",
    "description": "A synthetic preservative used to prevent mould and bacteria in acidic foods and beverages. When combined with vitamin C (ascorbic acid), it can form benzene, a known carcinogen.",
    "safety_level": "caution",
    "health_concerns": [
      "Can form benzene when combined with ascorbic acid",
      "Linked to hyperactivity in children in some studies",
      "May trigger asthma in sensitive individuals"
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
]
```

**Country status values:** `"permitted"`, `"permitted_with_limits"`, `"banned"`, `"under_review"`, `"no_data"`

---

### 11.2 Supabase Functions (RPC)

**`increment_scan_count(user_id)`** — atomically increments scan count on the profiles table

**`get_scan_with_ingredients(scan_id)`** — returns a scan joined with its full ingredient objects (avoids N+1 queries on the results screen)

---

## 12. Monetization Model

### 12.1 Tiers

| Feature | Free | Pro ($4.99/month or $34.99/year) |
|---|---|---|
| Scans per month | 5 | Unlimited |
| Basic ingredient definitions | ✅ | ✅ |
| Safety level (Safe/Caution/Harmful) | ✅ | ✅ |
| Full AI descriptions | ❌ (truncated) | ✅ |
| Country ban data | ❌ | ✅ |
| Health concerns list | ❌ | ✅ |
| Scan history (number saved) | Last 10 | Unlimited |
| Export scan results (PDF) | ❌ | ✅ (future) |

### 12.2 Paywall trigger points
- When free user attempts scan #6 in a month
- When free user taps "Country ban data" section (blurred/locked)
- When free user taps "Full description" (truncated with upgrade prompt)
- From Settings → "Upgrade to Pro"

### 12.3 RevenueCat configuration
- Product IDs:
  - `ingryn_pro_monthly` — $4.99/month
  - `ingryn_pro_annual` — $34.99/year (saves ~42%)
- Offerings configured in RevenueCat dashboard
- Entitlement: `pro`

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Scan-to-results time: < 10 seconds (target < 7 seconds on mid-range device)
- App launch to home screen: < 3 seconds (cold start)
- OCR processing: < 2 seconds (on-device, ML Kit)
- Gemini API response: < 5 seconds (target < 3 seconds)
- History list scroll: 60 fps with no jank for up to 500 scan records

### 13.2 Reliability
- Claude API failure: show user-friendly error + "Try again" button; do not lose the OCR-extracted text
- Network failure during analysis: queue retry with exponential backoff (3 attempts)
- Supabase downtime: cached scans still viewable offline

### 13.3 Security
- All API keys stored in environment variables, never committed to source control
- Supabase Row Level Security (RLS) enabled on all tables — users can only access their own data
- Claude API called server-side (Supabase Edge Function) — API key never exposed to the client
- JWT tokens validated on every authenticated request

### 13.4 Privacy
- No selling of user scan data to third parties
- Scan images stored in Supabase Storage with private bucket (only accessible by authenticated user)
- GDPR-compliant: user can delete all their data from the app
- No analytics that identify individual users (aggregate only)
- Privacy policy URL: required for App Store + Play Store submission

### 13.5 Accessibility
- All interactive elements have accessible labels
- Minimum touch target size: 44×44pt
- Colour is never the only indicator of safety level (always paired with a text label)
- Supports system font size scaling

### 13.6 App Store Requirements
- Camera permission string: "INGRYN needs camera access to scan ingredient labels"
- Photo library permission: not required
- iOS minimum deployment target: iOS 15
- Android minimum SDK: API 26 (Android 8.0)

---

## 14. Release Phases

### Phase 1 — Foundation (Weeks 1–2)
- Project setup (Expo, Expo Router, NativeWind)
- Supabase project + auth (email + Google OAuth)
- Tab navigation shell
- Home screen (static)

### Phase 2 — Core Scanner (Weeks 3–4)
- Camera screen with ML Kit OCR
- Claude API integration + prompt engineering
- Results screen (full ingredient breakdown)
- Ingredient detail screen

### Phase 3 — Data Persistence (Week 5)
- Scan history saved to Supabase
- History screen
- Ingredient caching in Supabase (avoid redundant API calls)

### Phase 4 — Monetisation (Week 6)
- RevenueCat integration
- Paywall screen
- Free tier scan limit enforcement
- Feature gating (country data, full descriptions)

### Phase 5 — Polish & Launch (Week 7–8)
- Onboarding flow
- Settings screen
- Error states + edge case handling
- Performance optimisation
- App Store + Play Store assets
- TestFlight / internal testing
- Submission

---

## 15. Open Questions & Risks

| # | Question / Risk | Owner | Status |
|---|---|---|---|
| 1 | Gemini 2.5 Flash free tier gives 1,500 req/day (~45,000 scans/month). Paid tier is $0.075/1M input tokens — effectively free at early scale. No cost concern until significant user growth. | Dev | Resolved |
| 2 | ML Kit OCR accuracy on non-standard labels (glossy packaging, small print, curved surfaces) | Dev | To test |
| 3 | Country ban data accuracy — Claude's training data may have a cutoff. Consider a manual verification layer for high-confidence ban claims. | Product | Open |
| 4 | App Store approval risk: ingredient analysis apps have been rejected before for medical claims. Copy must be clearly framed as informational, not medical advice. | Product | Mitigation needed |
| 5 | What happens if OCR extracts garbled text? Need a confidence threshold — if extracted text is < 50 characters or contains no recognisable ingredient patterns, prompt user to retake the photo. | Dev | Open |
| 6 | Should the Gemini API call go client-side (simpler) or via Supabase Edge Function (more secure, hides API key)? Edge Function recommended for production. | Dev | Decision needed |
| 7 | Language support — ingredient labels in India may mix English and Hindi. What is the OCR and analysis behaviour on mixed-script labels? | Dev | Open |

---

*End of PRD v1.0*

*This document should be treated as a living spec. Update version number and date on every significant change.*