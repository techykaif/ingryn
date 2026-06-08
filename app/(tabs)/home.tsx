import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator, Dimensions
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'

const { width } = Dimensions.get('window')

type Scan = {
  id: string
  label: string | null
  safety_score: number | null
  created_at: string
  ingredient_count: number
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [firstName, setFirstName] = useState('')

  const fetchData = useCallback(async () => {
    try {
      // Get user profile name
      const fullName = user?.user_metadata?.full_name || user?.email || ''
      setFirstName(fullName.split(' ')[0] || 'there')

      // Fetch recent scans
      const { data, error } = await supabase
        .from('scans')
        .select('id, label, safety_score, created_at, ingredient_ids')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        label: s.label,
        safety_score: s.safety_score,
        created_at: s.created_at,
        ingredient_count: s.ingredient_ids?.length || 0,
      }))

      setScans(mapped)
    } catch (e) {
      console.error('Home fetch error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  // Refresh when screen comes into focus (e.g. after a scan)
  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData])
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#555'
    if (score >= 75) return '#00E5A0'
    if (score >= 45) return '#EF9F27'
    return '#E24B4A'
  }

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'N/A'
    if (score >= 75) return 'Safe'
    if (score >= 45) return 'Caution'
    return 'Harmful'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#00E5A0" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00E5A0"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.profileInitial}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero scan card */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push('/(tabs)/scanner')}
          activeOpacity={0.9}
        >
          <View style={styles.heroCardInner}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Scan Ingredients</Text>
              <Text style={styles.heroSubtitle}>
                Point your camera at any{'\n'}ingredient label
              </Text>
              <View style={styles.heroCTA}>
                <Text style={styles.heroCTAText}>Start scanning →</Text>
              </View>
            </View>
            <View style={styles.heroIcon}>
              <View style={styles.heroHex}>
                <View style={styles.heroDot} />
              </View>
              <View style={styles.heroLine} />
              <View style={styles.heroLine2} />
              <View style={styles.heroLine3} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{scans.length}</Text>
            <Text style={styles.statLabel}>Total scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#E24B4A' }]}>
              {scans.filter(s => s.safety_score !== null && s.safety_score < 45).length}
            </Text>
            <Text style={styles.statLabel}>Harmful found</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#00E5A0' }]}>
              {scans.filter(s => s.safety_score !== null && s.safety_score >= 75).length}
            </Text>
            <Text style={styles.statLabel}>All safe</Text>
          </View>
        </View>

        {/* Recent scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent scans</Text>
            {scans.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {scans.length === 0 ? (
            <EmptyState onScan={() => router.push('/(tabs)/scanner')} />
          ) : (
            scans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={styles.scanCard}
                onPress={() => router.push(`/results/${scan.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.scanCardLeft}>
                  <View style={[
                    styles.scoreRing,
                    { borderColor: getScoreColor(scan.safety_score) }
                  ]}>
                    <Text style={[
                      styles.scoreText,
                      { color: getScoreColor(scan.safety_score) }
                    ]}>
                      {scan.safety_score ?? '?'}
                    </Text>
                  </View>
                </View>
                <View style={styles.scanCardMiddle}>
                  <Text style={styles.scanLabel} numberOfLines={1}>
                    {scan.label || 'Unnamed scan'}
                  </Text>
                  <Text style={styles.scanMeta}>
                    {scan.ingredient_count} ingredients · {formatDate(scan.created_at)}
                  </Text>
                </View>
                <View style={styles.scanCardRight}>
                  <View style={[
                    styles.scoreBadge,
                    { backgroundColor: `${getScoreColor(scan.safety_score)}15` }
                  ]}>
                    <Text style={[
                      styles.scoreBadgeText,
                      { color: getScoreColor(scan.safety_score) }
                    ]}>
                      {getScoreLabel(scan.safety_score)}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tips section */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
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

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>⬡</Text>
      </View>
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptySubtitle}>
        Scan your first product to see{'\n'}what's really inside
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onScan}>
        <Text style={styles.emptyButtonText}>Scan now</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#00E5A008',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00E5A005',
    bottom: 200,
    left: -80,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: '#555',
    fontWeight: '400',
  },
  name: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00E5A015',
    borderWidth: 1,
    borderColor: '#00E5A030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00E5A0',
  },
  heroCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#00E5A0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#080808',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#08080880',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroCTA: {
    backgroundColor: '#08080815',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroCTAText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#080808',
  },
  heroIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHex: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#08080820',
    borderWidth: 2,
    borderColor: '#08080830',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#080808',
  },
  heroLine: {
    position: 'absolute',
    width: 60,
    height: 1.5,
    backgroundColor: '#08080820',
    top: 28,
  },
  heroLine2: {
    position: 'absolute',
    width: 1.5,
    height: 60,
    backgroundColor: '#08080820',
    left: 39,
  },
  heroLine3: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#08080815',
    borderStyle: 'dashed',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 28,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sectionLink: {
    fontSize: 13,
    color: '#00E5A0',
    fontWeight: '500',
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  scanCardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scanCardMiddle: {
    flex: 1,
    gap: 4,
  },
  scanLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  scanMeta: {
    fontSize: 12,
    color: '#444',
  },
  scanCardRight: {
    alignItems: 'center',
    gap: 6,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 18,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIconText: {
    fontSize: 32,
    color: '#00E5A0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: '#00E5A015',
    borderWidth: 1,
    borderColor: '#00E5A030',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00E5A0',
  },
  tipCard: {
    marginHorizontal: 24,
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  tipText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
})