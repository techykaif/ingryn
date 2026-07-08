import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Image, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import { Scan, ShieldCheck, Globe, ArrowRight } from 'phosphor-react-native'

const FEATURES = [
  {
    icon: Scan,
    color: Colors.primary,
    bg: Colors.primaryLight,
    title: 'Scan any label',
    desc: 'Instant AI analysis of every ingredient.',
  },
  {
    icon: ShieldCheck,
    color: Colors.info,
    bg: Colors.infoLight,
    title: 'Safety ratings',
    desc: 'Safe, Caution, or Harmful — clearly explained.',
  },
  {
    icon: Globe,
    color: Colors.warning,
    bg: Colors.warningLight,
    title: 'Global ban checks',
    desc: 'Banned in the US, EU, India, Japan and more.',
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

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }} showsVerticalScrollIndicator={false}>
        {/* ─── Hero ─── */}
        <View style={styles.hero}>
          <Image
            source={require('@/assets/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brand}>INGRYN</Text>
          <Text style={styles.tagline}>Know what's inside.</Text>
          <Text style={styles.subtagline}>
            AI-powered ingredient analysis for the products you use every day.
          </Text>
        </View>

        {/* ─── Features ─── */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, Shadows.sm]}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <f.icon size={18} color={f.color} weight="fill" />
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
          {[
            { value: '10s', label: 'Scan time' },
            { value: '117+', label: 'Ingredients' },
            { value: '8', label: 'Countries' },
          ].map((s, i, arr) => (
            <View key={s.label} style={styles.statGroup}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </View>
          ))}
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
              <View style={styles.arrowCircle}>
                <ArrowRight size={16} color={Colors.primary} weight="bold" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signin')}
            activeOpacity={0.7}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>
              Already have an account?{' '}
              <Text style={styles.secondaryBtnLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/terms')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/privacy')}>Privacy Policy</Text>
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${Colors.primary}12`,
    top: -80,
    right: -60,
  },
  blob2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${Colors.primary}08`,
    bottom: 60,
    left: -50,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'android' ? Spacing.xl : 0,
    paddingBottom: Spacing.lg,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    marginBottom: Spacing.xs,
    ...Shadows.primary,
  },
  brand: {
    fontFamily: Fonts.extrabold,
    fontSize: FontSizes['4xl'],
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtagline: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },

  // Features
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontFamily: Fonts.semibold,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
  },
  statGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: Fonts.extrabold,
    fontSize: FontSizes['2xl'],
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },

  // CTAs
  ctas: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  primaryBtnWrapper: {
    width: '100%',
    borderRadius: Radius.xl,
    ...Shadows.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
    borderRadius: Radius.xl,
  },
  primaryBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: '#fff',
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    paddingVertical: Spacing.xs,
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
    lineHeight: 17,
    paddingHorizontal: Spacing.xl,
  },
  legalLink: {
    fontFamily: Fonts.semibold,
    color: Colors.primary,
  },
})