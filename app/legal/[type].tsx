import { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, ShieldCheck, FileText, CheckCircle } from 'phosphor-react-native'
import { Colors, Fonts, FontSizes, Radius, Shadows, Spacing } from '@/constants/theme'

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    lastUpdated: 'July 1, 2026',
    intro:
      'INGRYN helps you understand ingredient labels by processing scanned text and optional dietary preferences. We use the minimum information needed to provide that experience safely and reliably.',
    sections: [
      {
        heading: 'What we collect',
        body:
          'We collect your account information (email, display name), dietary preferences you choose to save, scan text you submit for analysis, and basic app usage information needed to keep the service working.',
      },
      {
        heading: 'How we use it',
        body:
          'Your data is used to analyze ingredients, personalize safety warnings, save scan history, and improve the app experience. We do not sell your personal data.',
      },
      {
        heading: 'Data storage',
        body:
          'Account and scan data are stored securely through Supabase. Some analysis may be processed via our AI service to generate ingredient insights and safety flags.',
      },
      {
        heading: 'Your choices',
        body:
          'You can update your preferences, sign out, or delete your account from Settings. Deleting your account removes your account and associated scan history where supported by the service.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    lastUpdated: 'July 1, 2026',
    intro:
      'These terms govern your use of the INGRYN app. By using the app, you agree to use it for lawful purposes and understand that ingredient analysis is informational, not medical advice.',
    sections: [
      {
        heading: 'Use of the app',
        body:
          'You may use INGRYN to scan product labels and review ingredient information. You agree not to misuse the app, attempt to bypass safeguards, or submit harmful or unlawful content.',
      },
      {
        heading: 'Accuracy',
        body:
          'Ingredient analysis is generated with AI and may occasionally be incomplete or inaccurate. Always verify important health or safety decisions with qualified professionals or official sources.',
      },
      {
        heading: 'Account responsibility',
        body:
          'You are responsible for keeping your account secure and for the accuracy of the information you provide. We are not liable for decisions made solely from app results.',
      },
      {
        heading: 'Changes',
        body:
          'We may update these terms or the app experience over time. Continued use after changes indicates that you accept the updated terms.',
      },
    ],
  },
} as const

type LegalType = keyof typeof LEGAL_CONTENT

export default function LegalScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ type?: string }>()

  const type = (params.type as LegalType | undefined) ?? 'privacy'
  const content = useMemo(() => {
    return LEGAL_CONTENT[type] ?? LEGAL_CONTENT.privacy
  }, [type])

  const Icon = content.icon

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: Colors.primaryLight }]}> 
            <Icon size={22} color={Colors.primary} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{content.title}</Text>
            <View style={styles.metaRow}>
              <CheckCircle size={14} color={Colors.success} weight="fill" />
              <Text style={styles.subtitle}>Last updated {content.lastUpdated}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, Shadows.md]}>
          <Text style={styles.heroBadge}>Transparency</Text>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

        {content.sections.map((section) => (
          <View key={section.heading} style={[styles.card, Shadows.sm]}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['2xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  heroBadge: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  intro: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
})
