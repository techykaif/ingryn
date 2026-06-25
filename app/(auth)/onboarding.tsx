import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, NativeScrollEvent,
  NativeSyntheticEvent, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')
const ONBOARDING_KEY = 'ingryn_onboarding_complete'

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F2FAF6',
  card: '#FFFFFF',
  cardBorder: '#E0F2E9',
  textPrimary: '#0D2B1E',
  textSecondary: '#5A8A72',
  textMuted: '#A8C5B5',
  accent: '#00C875',
  accentSoft: '#E6F9F1',
  accentBorder: '#B3EDD6',
  harmful: '#E05C5C',
  caution: '#F5A623',
  safe: '#00C875',
  tag1: '#00C875',
  tag2: '#7C6FF7',
  tag3: '#F5A623',
  tag4: '#00AAFF',
}

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    tag: 'Instant scan',
    tagColor: COLORS.tag1,
    title: 'Scan any\ningredient label',
    subtitle: 'Point your camera at any product. Our AI reads and analyses every ingredient in seconds.',
    preview: 'scan',
  },
  {
    id: '2',
    tag: 'AI powered',
    tagColor: COLORS.tag2,
    title: 'Know exactly\nwhat\'s inside',
    subtitle: 'Every ingredient explained in plain language — what it does, how safe it is, and why it matters.',
    preview: 'ingredients',
  },
  {
    id: '3',
    tag: '8 countries',
    tagColor: COLORS.tag3,
    title: 'Global safety\nchecks',
    subtitle: 'Instantly see if ingredients are banned or restricted in the US, EU, UK, India, Japan and more.',
    preview: 'countries',
  },
  {
    id: '4',
    tag: 'Personalised',
    tagColor: COLORS.tag4,
    title: 'Built for\nyour health',
    subtitle: 'Set your allergies, diet type, and health conditions — INGRYN flags what matters to you.',
    preview: 'personal',
  },
]

// ─── Preview widgets ──────────────────────────────────────────────────────────

function ScanPreview() {
  return (
    <View style={previewStyles.scanCard}>
      {/* Mock camera viewfinder */}
      <View style={previewStyles.scanViewfinder}>
        <View style={previewStyles.scanCornerTL} />
        <View style={previewStyles.scanCornerTR} />
        <View style={previewStyles.scanCornerBL} />
        <View style={previewStyles.scanCornerBR} />
        <View style={previewStyles.scanLines}>
          {[60, 80, 70, 90, 65, 75].map((w, i) => (
            <View key={i} style={[previewStyles.scanLine, { width: `${w}%` as any }]} />
          ))}
        </View>
        <View style={previewStyles.scanBeam} />
      </View>
      <View style={previewStyles.scanFooter}>
        <View style={previewStyles.scanDot} />
        <Text style={previewStyles.scanText}>Point at ingredient list</Text>
      </View>
    </View>
  )
}

function IngredientsPreview() {
  const items = [
    { name: 'Sodium Benzoate', cat: 'Preservative', level: 'caution', color: COLORS.caution },
    { name: 'Red 40', cat: 'Artificial Colour', level: 'harmful', color: COLORS.harmful },
    { name: 'Citric Acid', cat: 'Acidity Reg.', level: 'safe', color: COLORS.safe },
  ]
  return (
    <View style={previewStyles.ingredientsCard}>
      <View style={previewStyles.ingredientsHeader}>
        <Text style={previewStyles.ingredientsTitle}>Lays Classic</Text>
        <View style={previewStyles.scoreChip}>
          <Text style={previewStyles.scoreText}>62</Text>
        </View>
      </View>
      {items.map((item, i) => (
        <View key={i} style={previewStyles.ingredientRow}>
          <View style={{ flex: 1 }}>
            <Text style={previewStyles.ingredientName}>{item.name}</Text>
            <Text style={previewStyles.ingredientCat}>{item.cat}</Text>
          </View>
          <View style={[previewStyles.badge, { backgroundColor: item.color + '20' }]}>
            <Text style={[previewStyles.badgeText, { color: item.color }]}>{item.level}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

function CountriesPreview() {
  const countries = [
    { flag: '🇺🇸', name: 'United States', status: 'Permitted', color: COLORS.safe },
    { flag: '🇪🇺', name: 'European Union', status: 'Banned', color: COLORS.harmful },
    { flag: '🇯🇵', name: 'Japan', status: 'Banned', color: COLORS.harmful },
    { flag: '🇮🇳', name: 'India', status: 'Permitted', color: COLORS.safe },
  ]
  return (
    <View style={previewStyles.countriesCard}>
      <Text style={previewStyles.countriesTitle}>Potassium Bromate</Text>
      <Text style={previewStyles.countriesSub}>Flour treatment agent</Text>
      <View style={previewStyles.countriesDivider} />
      {countries.map((c, i) => (
        <View key={i} style={previewStyles.countryRow}>
          <Text style={previewStyles.countryFlag}>{c.flag}</Text>
          <Text style={previewStyles.countryName}>{c.name}</Text>
          <Text style={[previewStyles.countryStatus, { color: c.color }]}>{c.status}</Text>
        </View>
      ))}
    </View>
  )
}

function PersonalPreview() {
  const chips = [
    { label: '🌾 Gluten', active: true, color: COLORS.harmful },
    { label: '🥛 Dairy', active: true, color: COLORS.harmful },
    { label: '🌱 Vegan', active: true, color: COLORS.tag2 },
    { label: '🩸 Diabetes', active: false, color: COLORS.caution },
    { label: '🥜 Peanuts', active: false, color: COLORS.caution },
    { label: '❤️ Hypertension', active: true, color: COLORS.caution },
  ]
  return (
    <View style={previewStyles.personalCard}>
      <Text style={previewStyles.personalTitle}>Your health profile</Text>
      <View style={previewStyles.chipsWrap}>
        {chips.map((c, i) => (
          <View key={i} style={[
            previewStyles.chip,
            c.active && { backgroundColor: c.color + '15', borderColor: c.color + '40' }
          ]}>
            <Text style={[previewStyles.chipText, c.active && { color: c.color }]}>{c.label}</Text>
          </View>
        ))}
      </View>
      <View style={previewStyles.personalAlert}>
        <Text style={previewStyles.personalAlertIcon}>⚠️</Text>
        <Text style={previewStyles.personalAlertText}>3 ingredients flagged for you</Text>
      </View>
    </View>
  )
}

const previewStyles = StyleSheet.create({
  // Scan
  scanCard: {
    width: '100%', backgroundColor: COLORS.card,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 16, gap: 12,
    shadowColor: '#00C875', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  scanViewfinder: {
    height: 130, backgroundColor: '#0D2B1E08',
    borderRadius: 12, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  scanCornerTL: {
    position: 'absolute', top: 8, left: 8,
    width: 16, height: 16, borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: COLORS.accent, borderRadius: 2,
  },
  scanCornerTR: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderTopWidth: 2, borderRightWidth: 2,
    borderColor: COLORS.accent, borderRadius: 2,
  },
  scanCornerBL: {
    position: 'absolute', bottom: 8, left: 8,
    width: 16, height: 16, borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: COLORS.accent, borderRadius: 2,
  },
  scanCornerBR: {
    position: 'absolute', bottom: 8, right: 8,
    width: 16, height: 16, borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: COLORS.accent, borderRadius: 2,
  },
  scanLines: { gap: 6, alignItems: 'flex-start', width: '70%' },
  scanLine: { height: 6, backgroundColor: '#0D2B1E12', borderRadius: 3 },
  scanBeam: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: COLORS.accent, opacity: 0.4, top: '40%',
  },
  scanFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  scanText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },

  // Ingredients
  ingredientsCard: {
    width: '100%', backgroundColor: COLORS.card,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 16, gap: 10,
    shadowColor: '#7C6FF7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  ingredientsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ingredientsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  scoreChip: {
    backgroundColor: COLORS.caution + '20', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 8,
  },
  scoreText: { fontSize: 13, fontWeight: '800', color: COLORS.caution },
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7FCF9', borderRadius: 10,
    padding: 10,
  },
  ingredientName: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  ingredientCat: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  // Countries
  countriesCard: {
    width: '100%', backgroundColor: COLORS.card,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 16,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  countriesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  countriesSub: { fontSize: 11, color: COLORS.textMuted, marginBottom: 12 },
  countriesDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginBottom: 10 },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  countryFlag: { fontSize: 16 },
  countryName: { flex: 1, fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  countryStatus: { fontSize: 11, fontWeight: '700' },

  // Personal
  personalCard: {
    width: '100%', backgroundColor: COLORS.card,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 16, gap: 12,
    shadowColor: '#00AAFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  personalTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: '#F7FCF9', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  chipText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  personalAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.caution + '12', borderRadius: 10,
    padding: 10,
  },
  personalAlertIcon: { fontSize: 14 },
  personalAlertText: { fontSize: 12, color: COLORS.caution, fontWeight: '600' },
})

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true })
      setActiveIndex(activeIndex + 1)
    } else {
      handleGetStarted()
    }
  }

  async function handleGetStarted() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(auth)/welcome')
  }

  async function handleSignIn() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(auth)/signin')
  }

  async function handleSkip() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(auth)/welcome')
  }

  const slide = SLIDES[activeIndex]
  const isLast = activeIndex === SLIDES.length - 1
  const tagColor = slide.tagColor

  function renderPreview() {
    switch (slide.preview) {
      case 'scan': return <ScanPreview />
      case 'ingredients': return <IngredientsPreview />
      case 'countries': return <CountriesPreview />
      case 'personal': return <PersonalPreview />
      default: return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((s, index) => (
          <View key={s.id} style={styles.slide}>
            {/* Tag */}
            <View style={[styles.tagChip, {
              backgroundColor: s.tagColor + '18',
              borderColor: s.tagColor + '40',
            }]}>
              <View style={[styles.tagDot, { backgroundColor: s.tagColor }]} />
              <Text style={[styles.tagText, { color: s.tagColor }]}>{s.tag}</Text>
            </View>

            {/* Preview widget */}
            <View style={styles.previewContainer}>
              {index === 0 && <ScanPreview />}
              {index === 1 && <IngredientsPreview />}
              {index === 2 && <CountriesPreview />}
              {index === 3 && <PersonalPreview />}
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <TouchableOpacity
              key={i}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * width, animated: true })
                setActiveIndex(i)
              }}
            >
              <View style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? tagColor : COLORS.cardBorder,
                  width: i === activeIndex ? 28 : 6,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Primary button */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: tagColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            {isLast ? 'Get started →' : 'Next →'}
          </Text>
        </TouchableOpacity>

        {/* Sign in link */}
        <TouchableOpacity style={styles.signinRow} onPress={handleSignIn}>
          <Text style={styles.signinText}>
            Already have an account?{' '}
            <Text style={[styles.signinLink, { color: tagColor }]}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00C87514',
    top: -100,
    right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00C87510',
    bottom: 100,
    left: -60,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  skipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
    gap: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  previewContainer: {
    width: '100%',
  },
  textContent: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 52 : 40,
    paddingTop: 16,
    gap: 14,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#00C875',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  signinRow: {
    paddingVertical: 4,
  },
  signinText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  signinLink: {
    fontWeight: '700',
  },
})