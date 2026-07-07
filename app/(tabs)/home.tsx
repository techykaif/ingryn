import { useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator, Image
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  Scan as ScanIcon, Clock, ChartBar,
  ArrowRight, Warning, Bell, Plus, List, SealCheck, ClockCounterClockwise,
  CheckCircle, Sparkle, ShieldWarning, Question
} from 'phosphor-react-native'
import { getScoreColor, getScoreLabel, formatDate } from '@/lib/scanUtils'
import { LinearGradient } from 'expo-linear-gradient'

type ScanRecord = {
  id: string
  label: string | null
  safety_score: number | null
  created_at: string
  ingredient_count: number
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [totalScans, setTotalScans] = useState(0)
  const [harmfulCount, setHarmfulCount] = useState(0)
  const [safeCount, setSafeCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setErrorMsg('')
      if (!user?.id) return
      const fullName = user?.user_metadata?.full_name || user?.email || ''
      setFirstName(fullName.split(' ')[0] || 'there')

      const [{ data, error }, { count }, { count: harmful }, { count: safe }] = await Promise.all([
        supabase
          .from('scans')
          .select('id, label, safety_score, created_at, ingredient_ids')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('scans')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('scans')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lt('safety_score', 45),
        supabase
          .from('scans')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('safety_score', 75),
      ])

      if (error) throw error

      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        label: s.label,
        safety_score: s.safety_score,
        created_at: s.created_at,
        ingredient_count: s.ingredient_ids?.length || 0,
      }))

      setScans(mapped)
      setTotalScans(count || 0)
      setHarmfulCount(harmful || 0)
      setSafeCount(safe || 0)
    } catch (e: any) {
      console.error('Home fetch error:', e)
      setErrorMsg(e.message || 'Failed to load your dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData() }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarInitial}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Warning size={14} color={Colors.danger} weight="fill" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Hero scan card */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/(tabs)/scanner')}
          style={styles.heroWrapper}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.heroContent}>
              <View style={styles.heroIconBox}>
                <ScanIcon size={28} color="#fff" weight="bold" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Scan Ingredients</Text>
                <Text style={styles.heroSub}>
                  Point at any label for{'\n'}instant AI analysis
                </Text>
              </View>
            </View>
            <View style={styles.heroArrow}>
              <ArrowRight size={20} color="rgba(255,255,255,0.8)" weight="bold" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard
            value={totalScans}
            label="Total Scans"
            icon={<ChartBar size={18} color={Colors.primary} weight="fill" />}
            color={Colors.primary}
            bg={Colors.primaryLight}
          />
          <StatCard
            value={harmfulCount}
            label="Harmful Found"
            icon={<Warning size={18} color={Colors.harmful} weight="fill" />}
            color={Colors.harmful}
            bg={Colors.harmfulLight}
          />
          <StatCard
            value={safeCount}
            label="All Safe"
            icon={<CheckCircle size={18} color={Colors.safe} weight="fill" />}
            color={Colors.safe}
            bg={Colors.safeLight}
          />
        </View>

        {/* Recent scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {scans.length > 0 && (
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push('/(tabs)/history')}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <ArrowRight size={14} color={Colors.primary} weight="bold" />
              </TouchableOpacity>
            )}
          </View>

          {scans.length === 0 ? (
            <EmptyState onScan={() => router.push('/(tabs)/scanner')} />
          ) : (
            scans.map(scan => (
              <ScanCard
                key={scan.id}
                scan={scan}
                onPress={() => router.push(`/results/${scan.id}`)}
                getScoreColor={getScoreColor}
                getScoreLabel={getScoreLabel}
                formatDate={formatDate}
              />
            ))
          )}
        </View>

        {/* Tip card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Sparkle size={18} color={Colors.primary} weight="fill" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro tip</Text>
            <Text style={styles.tipText}>
              Good lighting and a flat surface improve scan accuracy significantly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function StatCard({ value, label, icon, color, bg }: {
  value: number; label: string; icon: React.ReactNode; color: string; bg: string
}) {
  return (
    <View style={[styles.statCard, Shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ScanCard({ scan, onPress, getScoreColor, getScoreLabel, formatDate }: {
  scan: ScanRecord; onPress: () => void
  getScoreColor: (s: number | null) => string
  getScoreLabel: (s: number | null) => string
  formatDate: (d: string) => string
}) {
  const color = getScoreColor(scan.safety_score)
  const label = getScoreLabel(scan.safety_score)
  const isHarmful = label === 'Harmful'
  const isCaution = label === 'Caution'
  const isNA = label === 'N/A'
  return (
    <TouchableOpacity style={[styles.scanCard, Shadows.sm]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.scoreRingOuter, { borderColor: `${color}30` }]}>
        <View style={[styles.scoreRingInner, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.scoreRingNum, { color }]}>{scan.safety_score ?? '?'}</Text>
        </View>
      </View>
      <View style={styles.scanInfo}>
        <Text style={styles.scanLabel} numberOfLines={1}>{scan.label || 'Unnamed scan'}</Text>
        <Text style={styles.scanMeta}>{scan.ingredient_count} ingredients · {formatDate(scan.created_at)}</Text>
      </View>
      <View style={styles.scanRight}>
        <View style={[styles.safetyBadge, { backgroundColor: `${color}15` }]}>
          {isHarmful && <ShieldWarning size={11} color={color} weight="fill" />}
          {isCaution && <Warning size={11} color={color} weight="fill" />}
          {!isHarmful && !isCaution && !isNA && <CheckCircle size={11} color={color} weight="fill" />}
          {isNA && <Question size={11} color={color} weight="bold" />}
          <Text style={[styles.safetyBadgeText, { color }]}>{label}</Text>
        </View>
        <ArrowRight size={14} color={Colors.textTertiary} weight="bold" />
      </View>
    </TouchableOpacity>
  )
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Image source={require('@/assets/icon.png')} style={styles.emptyIconBox} />
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptySubtitle}>Scan your first product to see{'\n'}what's really inside</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onScan}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyBtnGradient}
        >
          <ScanIcon size={16} color="#fff" weight="bold" />
          <Text style={styles.emptyBtnText}>Scan now</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 0, paddingHorizontal: Spacing['2xl'], marginBottom: Spacing['2xl'],
  },
  greeting: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary },
  name: { fontFamily: Fonts.extrabold, fontSize: FontSizes['4xl'], color: Colors.textPrimary, marginTop: 2 },
  avatarBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  avatarGradient: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: '#fff' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.danger}15`, padding: Spacing.md, borderRadius: Radius.lg, gap: Spacing.sm, marginHorizontal: Spacing['2xl'], marginBottom: Spacing.xl },
  errorBannerText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger, lineHeight: 20 },
  heroWrapper: { marginHorizontal: Spacing['2xl'], marginBottom: Spacing.xl, borderRadius: Radius['2xl'], overflow: 'hidden', ...Shadows.primary },
  heroCard: { borderRadius: Radius['2xl'], padding: Spacing['2xl'], flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroCircle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40 },
  heroCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: 40 },
  heroContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  heroIconBox: { width: 56, height: 56, borderRadius: Radius.xl, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: Fonts.extrabold, fontSize: FontSizes['2xl'], color: '#fff', marginBottom: 4 },
  heroSub: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  heroArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing['2xl'], gap: Spacing.md, marginBottom: Spacing['2xl'] },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: Fonts.extrabold, fontSize: FontSizes['3xl'] },
  statLabel: { fontFamily: Fonts.medium, fontSize: FontSizes.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  section: { paddingHorizontal: Spacing['2xl'], marginBottom: Spacing['2xl'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: Colors.textPrimary },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontFamily: Fonts.semibold, fontSize: FontSizes.sm, color: Colors.primary },
  scanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md },
  scoreRingOuter: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreRingInner: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  scoreRingNum: { fontFamily: Fonts.extrabold, fontSize: FontSizes.base },
  scanInfo: { flex: 1, gap: 3 },
  scanLabel: { fontFamily: Fonts.semibold, fontSize: FontSizes.md, color: Colors.textPrimary },
  scanMeta: { fontFamily: Fonts.regular, fontSize: FontSizes.xs, color: Colors.textTertiary },
  scanRight: { alignItems: 'center', gap: 6 },
  safetyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  safetyBadgeText: { fontFamily: Fonts.bold, fontSize: FontSizes.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.md },
  emptyIconBox: { width: 80, height: 80, borderRadius: Radius['2xl'], marginBottom: Spacing.sm },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: FontSizes['2xl'], color: Colors.textPrimary },
  emptySubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: Spacing.sm, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.primary },
  emptyBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg },
  emptyBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.md, color: '#fff' },
  tipCard: { marginHorizontal: Spacing['2xl'], backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, ...Shadows.sm },
  tipIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  tipContent: { flex: 1, gap: 4 },
  tipTitle: { fontFamily: Fonts.semibold, fontSize: FontSizes.base, color: Colors.textPrimary },
  tipText: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
})