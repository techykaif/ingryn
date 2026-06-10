import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
  TextInput, RefreshControl
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'

type Scan = {
  id: string
  label: string | null
  safety_score: number | null
  created_at: string
  ingredient_ids: string[]
}

export default function HistoryScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchScans()
    }, [])
  )

  async function fetchScans() {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('id, label, safety_score, created_at, ingredient_ids')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setScans(data || [])
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function deleteScan(id: string) {
    Alert.alert(
      'Delete scan',
      'This will permanently remove this scan from your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(id)
            const { error } = await supabase.from('scans').delete().eq('id', id)
            setDeleting(null)
            if (error) {
              Alert.alert('Error', error.message)
            } else {
              setScans(prev => prev.filter(s => s.id !== id))
            }
          }
        }
      ]
    )
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filtered = scans.filter(s =>
    !search.trim() ||
    (s.label || '').toLowerCase().includes(search.toLowerCase())
  )

  const groupByDate = (scans: Scan[]) => {
    const groups: Record<string, Scan[]> = {}
    scans.forEach(scan => {
      const date = new Date(scan.created_at)
      const now = new Date()
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      const key = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff < 7 ? 'This week' : 'Earlier'
      if (!groups[key]) groups[key] = []
      groups[key].push(scan)
    })
    return groups
  }

  const grouped = groupByDate(filtered)
  const groupOrder = ['Today', 'Yesterday', 'This week', 'Earlier']

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00E5A0" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgCircle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchScans() }}
            tintColor="#00E5A0"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerCount}>
            {scans.length} {scans.length === 1 ? 'scan' : 'scans'}
          </Text>
        </View>

        {/* Search */}
        {scans.length > 0 && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search scans..."
              placeholderTextColor="#333"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty state */}
        {scans.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>⬡</Text>
            </View>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySubtitle}>
              Your scan history will appear here after you scan your first product
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/scanner')}
            >
              <Text style={styles.emptyBtnText}>Start scanning</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No search results */}
        {scans.length > 0 && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtitle}>No scans match "{search}"</Text>
          </View>
        )}

        {/* Grouped scans */}
        {groupOrder.map(group => {
          if (!grouped[group]) return null
          return (
            <View key={group} style={styles.group}>
              <Text style={styles.groupLabel}>{group}</Text>
              {grouped[group].map(scan => (
                <TouchableOpacity
                  key={scan.id}
                  style={styles.scanCard}
                  onPress={() => router.push(`/results/${scan.id}`)}
                  onLongPress={() => deleteScan(scan.id)}
                  activeOpacity={0.8}
                >
                  {deleting === scan.id ? (
                    <ActivityIndicator color="#00E5A0" size="small" />
                  ) : (
                    <>
                      <View style={[styles.scoreRing, { borderColor: getScoreColor(scan.safety_score) }]}>
                        <Text style={[styles.scoreText, { color: getScoreColor(scan.safety_score) }]}>
                          {scan.safety_score ?? '?'}
                        </Text>
                      </View>
                      <View style={styles.scanInfo}>
                        <Text style={styles.scanLabel} numberOfLines={1}>
                          {scan.label || 'Unnamed scan'}
                        </Text>
                        <Text style={styles.scanMeta}>
                          {scan.ingredient_ids?.length || 0} ingredients · {formatDate(scan.created_at)}
                        </Text>
                      </View>
                      <View style={styles.scanRight}>
                        <View style={[
                          styles.scoreBadge,
                          { backgroundColor: `${getScoreColor(scan.safety_score)}15` }
                        ]}>
                          <Text style={[styles.scoreBadgeText, { color: getScoreColor(scan.safety_score) }]}>
                            {getScoreLabel(scan.safety_score)}
                          </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        })}

        <Text style={styles.hint}>Long press a scan to delete it</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  loading: { flex: 1, backgroundColor: '#080808', alignItems: 'center', justifyContent: 'center' },
  bgCircle: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#00E5A006', top: -80, right: -80,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, marginBottom: 20,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#fff' },
  headerCount: { fontSize: 14, color: '#444' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, backgroundColor: '#111',
    borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a',
    paddingHorizontal: 14, marginBottom: 24, gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#fff', paddingVertical: 14 },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 13, color: '#444' },
  emptyState: {
    alignItems: 'center', paddingVertical: 60,
    paddingHorizontal: 40, gap: 12,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyIconText: { fontSize: 32, color: '#00E5A0' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptySubtitle: {
    fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8, backgroundColor: '#00E5A015',
    borderWidth: 1, borderColor: '#00E5A030',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#00E5A0' },
  group: { paddingHorizontal: 24, marginBottom: 24 },
  groupLabel: {
    fontSize: 12, fontWeight: '600', color: '#444',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  scanCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a',
    padding: 16, marginBottom: 8, gap: 12,
    minHeight: 72,
  },
  scoreRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  scoreText: { fontSize: 13, fontWeight: '700' },
  scanInfo: { flex: 1, gap: 4 },
  scanLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  scanMeta: { fontSize: 12, color: '#444' },
  scanRight: { alignItems: 'center', gap: 6 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { fontSize: 11, fontWeight: '700' },
  chevron: { fontSize: 18, color: '#333' },
  hint: {
    textAlign: 'center', fontSize: 11,
    color: '#222', paddingBottom: 8,
  },
})