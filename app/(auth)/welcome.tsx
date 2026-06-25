import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  Scan, ShieldCheck, Globe, ArrowRight, Leaf
} from 'phosphor-react-native'

const FEATURES = [
  {
    icon: Scan,
    color: Colors.primary,
    bg: Colors.primaryLight,
    title: 'Scan any label',
    desc: 'Point your camera at any ingredient list for instant AI analysis.',
  },
  {
    icon: ShieldCheck,
    color: Colors.info,
    bg: Colors.infoLight,
    title: 'Safety ratings',
    desc: 'Every ingredient rated Safe, Caution, or Harmful with full explanation.',
  },
  {
    icon: Globe,
    color: Colors.warning,
    bg: Colors.warningLight,
    title: 'Global ban checks',
    desc: 'See which ingredients are banned in the US, EU, India, Japan and more.',
  },
]

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ─── Hero section ─── */}
        <View style={styles.hero}>
          {/* Logo */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.logoGradient}
          >
            <Leaf size={36} color="#fff" weight="fill" />
          </LinearGradient>

          {/* Brand */}
          <Text style={styles.brand}>INGRYN</Text>
          <Text style={styles.tagline}>Know what's inside.</Text>
          <Text style={styles.subtagline}>
            AI-powered ingredient analysis for{'\n'}the products you use every day.
          </Text>
        </View>

        {/* ─── Feature cards ─── */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureCard, Shadows.sm]}>
              <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                <f.icon size={22} color={f.color} weight="fill" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Stats strip ─── */}
        <View style={[styles.statsStrip, Shadows.sm]}>
          <StatItem value="10s" label="Scan time" />
          <View style={styles.statDivider} />
          <StatItem value="117+" label="Ingredients" />
          <View style={styles.statDivider} />
          <StatItem value="8" label="Countries" />
        </View>

        {/* ─── CTAs ─── */}
        <View style={styles.ctas}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.9}
            style={styles.primaryBtnWrapper}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Get started — it's free</Text>
              <View style={styles.primaryBtnArrow}>
                <ArrowRight size={18} color={Colors.primary} weight="bold" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/signin')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>
              Already have an account?{' '}
              <Text style={styles.secondaryBtnLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blob1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: `${Colors.primary}12`,
    top: -120,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: `${Colors.primary}08`,
    bottom: 80,
    left: -80,
  },
  scroll: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 48,
    gap: Spacing['2xl'],
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.primary,
  },
  brand: {
    fontFamily: Fonts.extrabold,
    fontSize: FontSizes['6xl'],
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['3xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtagline: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 4,
  },

  // Features
  features: {
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.extrabold,
    fontSize: FontSizes['3xl'],
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  // CTAs
  ctas: {
    gap: Spacing.lg,
    alignItems: 'center',
  },
  primaryBtnWrapper: {
    width: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  primaryBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: '#fff',
    letterSpacing: 0.3,
  },
  primaryBtnArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    paddingVertical: Spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  secondaryBtnLink: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  legal: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
  },
})