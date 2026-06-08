import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background circles for depth */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Top section */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>⬡</Text>
          </View>
        </View>
        <Text style={styles.brand}>INGRYN</Text>
        <Text style={styles.tagline}>Know what's inside.</Text>
      </View>

      {/* Feature pills */}
      <View style={styles.featuresSection}>
        <FeaturePill emoji="🔬" text="AI-powered ingredient analysis" />
        <FeaturePill emoji="🌍" text="Country ban detection" />
        <FeaturePill emoji="⚡" text="Instant camera scanning" />
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/signin')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account?{' '}
            <Text style={styles.secondaryButtonHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  )
}

function FeaturePill({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillEmoji}>{emoji}</Text>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 48,
  },
  circle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#00E5A015',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00E5A008',
    bottom: 100,
    left: -60,
  },
  circle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00E5A010',
    top: 200,
    left: 40,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#00E5A015',
    borderWidth: 1,
    borderColor: '#00E5A030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 36,
    color: '#00E5A0',
  },
  brand: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    fontWeight: '300',
    letterSpacing: 1,
  },
  featuresSection: {
    gap: 12,
    marginVertical: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  pillEmoji: {
    fontSize: 20,
  },
  pillText: {
    fontSize: 15,
    color: '#ccc',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  bottomSection: {
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#00E5A0',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#080808',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  secondaryButtonHighlight: {
    color: '#00E5A0',
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
})