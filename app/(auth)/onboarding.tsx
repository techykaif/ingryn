import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useOnboarding } from '@/hooks/useOnboarding'

const { width, height } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    emoji: '📷',
    title: 'Scan any label',
    subtitle: 'Point your camera at any ingredient list and get instant AI-powered analysis in seconds.',
    accent: '#00E5A0',
    bg: '#00E5A008',
  },
  {
    id: '2',
    emoji: '🔬',
    title: 'Know what\'s inside',
    subtitle: 'Every ingredient explained clearly — what it is, what it does, and whether it\'s safe.',
    accent: '#8B8BFF',
    bg: '#8B8BFF08',
  },
  {
    id: '3',
    emoji: '🌍',
    title: 'Global safety check',
    subtitle: 'See which ingredients are banned or restricted in the US, EU, India, Japan and more.',
    accent: '#EF9F27',
    bg: '#EF9F2708',
  },
  {
    id: '4',
    emoji: '⚡',
    title: 'Instant results',
    subtitle: 'Scanned ingredients are cached — the more you scan, the faster it gets.',
    accent: '#00E5A0',
    bg: '#00E5A008',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { completeOnboarding } = useOnboarding()
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
      handleFinish()
    }
  }

  async function handleFinish() {
    await completeOnboarding()
    router.replace('/(auth)/welcome')
  }

  const slide = SLIDES[activeIndex]

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
            {/* Background glow */}
            <View style={[styles.glow, { backgroundColor: s.bg }]} />
            <View style={[styles.glowSmall, { backgroundColor: s.bg }]} />

            {/* Icon */}
            <View style={[styles.iconWrapper, {
              backgroundColor: s.bg,
              borderColor: s.accent + '30',
            }]}>
              <Text style={styles.icon}>{s.emoji}</Text>
            </View>

            {/* Brand */}
            <Text style={styles.brand}>INGRYN</Text>

            {/* Content */}
            <Text style={[styles.title, { color: '#fff' }]}>{s.title}</Text>
            <Text style={styles.subtitle}>{s.subtitle}</Text>

            {/* Step indicator inline */}
            <View style={styles.slideNumber}>
              <Text style={[styles.slideNumberText, { color: s.accent }]}>
                {index + 1}/{SLIDES.length}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * width, animated: true })
                setActiveIndex(i)
              }}
            >
              <View style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? slide.accent : '#222',
                  width: i === activeIndex ? 24 : 6,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'Get started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        {activeIndex === SLIDES.length - 1 && (
          <TouchableOpacity
            style={styles.signinBtn}
            onPress={handleFinish}
          >
            <Text style={styles.signinText}>
              Already have an account?{' '}
              <Text style={[styles.signinHighlight, { color: slide.accent }]}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  skipText: {
    fontSize: 13,
    color: '#555',
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
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -60,
    right: -60,
  },
  glowSmall: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -60,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  brand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  slideNumber: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  slideNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 52,
    paddingTop: 24,
    gap: 16,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#222',
  },
  nextBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#080808',
    letterSpacing: 0.3,
  },
  signinBtn: {
    paddingVertical: 4,
  },
  signinText: {
    fontSize: 14,
    color: '#444',
  },
  signinHighlight: {
    fontWeight: '600',
  },
})