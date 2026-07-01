import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, TextInput, ActivityIndicator,
  Alert, Platform
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  MagnifyingGlass, ClockCounterClockwise, Trash,
  ArrowRight, Warning, CheckCircle, ShieldWarning,
  Scan as ScanIcon, X
} from 'phosphor-react-native'

type ScanItem = {
  id: string
  label: string | null
  safety_score: number | null
  created_at: string
  ingredient_ids: string[]
}

export default function HistoryScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [scans, setScans] = useState<ScanItem[]>([])
  const [filtered, setFiltered] = useState<ScanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchScans = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1)

      if (error) throw error
      setScans(data || [])
      setFiltered(data || [])
    } catch (e: any) {
      setErrorMessage(e.message || 'Unable to load history right now.')
    } finally {
      setLoading(false)
    }
  }, [user, pageSize])

  useFocusEffect(useCallback(() => { fetchScans() }, [fetchScans]))

  function handleSearch(text: string) {
    setSearchQuery(text)
    if (!text.trim()) { setFiltered(scans); return }
    const q = text.toLowerCase()
    setFiltered(scans.filter(s => (s.label || '').toLowerCase().includes(q)))
  }

  function clearSearch() {
    setSearchQuery('')
    setFiltered(scans)
  }

  function confirmDelete(scanId: string) {
    Alert.alert(
      'Delete scan',
      'This scan will be permanently removed from your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteScan(scanId) },
      ]
    )
  }

  async function deleteScan(scanId: string) {
    setDeleting(scanId)
    try {
      if (!user?.id) return
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', user?.id)
      if (error) throw error
      const updated = scans.filter(s => s.id !== scanId)
      setScans(updated)
      setFiltered(updated.filter(s =>
        !searchQuery || (s.label || '').toLowerCase().includes(searchQuery.toLowerCase())
      ))
      setErrorMessage('')
    } catch (e: any) {
      setErrorMessage(e.message || 'Unable to delete this scan right now.')
    } finally {
      setDeleting(null)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return Colors.unknown
    if (score >= 75) return Colors.safe
    if (score >= 45) return Colors.caution
    return Colors.harmful
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
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const renderItem = ({ item }: { item: ScanItem }) => {
    const color = getScoreColor(item.safety_score)
    const label = getScoreLabel(item.safety_score)
    const isHarmful = label === 'Harmful'
    const isCaution = label === 'Caution'

    return (
      <TouchableOpacity
        style={[styles.card, Shadows.sm]}
        onPress={() => router.push(`/results/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={[styles.scoreRingOuter, { borderColor: `${color}30` }]}>
          <View style={[styles.scoreRingInner, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.scoreNum, { color }]}>
              {item.safety_score ?? '?'}
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel} numberOfLines={1}>
            {item.label || 'Unnamed scan'}
          </Text>
          <Text style={styles.cardMeta}>
            {item.ingredient_ids?.length || 0} ingredients · {formatDate(item.created_at)}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
            {isHarmful && <ShieldWarning size={10} color={color} weight="fill" />}
            {isCaution && <Warning size={10} color={color} weight="fill" />}
            {!isHarmful && !isCaution && <CheckCircle size={10} color={color} weight="fill" />}
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {deleting === item.id
              ? <ActivityIndicator size="small" color={Colors.danger} />
              : <Trash size={18} color={Colors.textTertiary} weight="regular" />
            }
          </TouchableOpacity>
          <ArrowRight size={16} color={Colors.textTertiary} weight="bold" />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          {scans.length} scan{scans.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color={Colors.textTertiary} weight="regular" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scans..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={Colors.textTertiary} weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Warning size={14} color={Colors.danger} weight="fill" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          {searchQuery ? (
            <>
              <MagnifyingGlass size={48} color={Colors.borderStrong} weight="regular" />
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySubtitle}>No scans match "{searchQuery}"</Text>
              <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
                <Text style={styles.clearBtnText}>Clear search</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ClockCounterClockwise size={48} color={Colors.borderStrong} weight="regular" />
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptySubtitle}>Your scan history will appear here</Text>
              <TouchableOpacity
                style={styles.scanNowBtn}
                onPress={() => router.push('/(tabs)/scanner')}
              >
                <ScanIcon size={16} color={Colors.primary} weight="bold" />
                <Text style={styles.scanNowText}>Start scanning</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={page < Math.ceil(scans.length / pageSize) ? <Text style={styles.moreText}>Showing the latest {pageSize} scans</Text> : null}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  title: { fontFamily: Fonts.extrabold, fontSize: FontSizes['5xl'], color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, marginTop: 4 },
  searchWrapper: { paddingHorizontal: Spacing['2xl'], marginBottom: Spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginHorizontal: Spacing['2xl'], marginBottom: Spacing.md },
  errorText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger, lineHeight: 18 },
  moreText: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.textTertiary, textAlign: 'center', paddingVertical: Spacing.lg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    gap: Spacing.md, ...Shadows.sm,
  },
  searchInput: {
    flex: 1, fontFamily: Fonts.regular, fontSize: FontSizes.base,
    color: Colors.textPrimary, padding: 0,
  },
  list: { paddingHorizontal: Spacing['2xl'], paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md,
  },
  scoreRingOuter: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreRingInner: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontFamily: Fonts.extrabold, fontSize: FontSizes.base },
  cardInfo: { flex: 1, gap: 4 },
  cardLabel: { fontFamily: Fonts.semibold, fontSize: FontSizes.md, color: Colors.textPrimary },
  cardMeta: { fontFamily: Fonts.regular, fontSize: FontSizes.xs, color: Colors.textTertiary },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginTop: 2,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: FontSizes.xs },
  cardActions: { alignItems: 'center', gap: Spacing.md },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing['3xl'] },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: FontSizes['2xl'], color: Colors.textPrimary, marginTop: Spacing.md },
  emptySubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  clearBtn: { marginTop: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  clearBtnText: { fontFamily: Fonts.semibold, fontSize: FontSizes.base, color: Colors.primary },
  scanNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  scanNowText: { fontFamily: Fonts.semibold, fontSize: FontSizes.base, color: Colors.primary },
})