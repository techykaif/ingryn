import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, TextInput, Modal
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'

type Ingredient = {
  id: string
  name: string
  aliases: string[]
  category: string
  description: string
  safety_level: 'safe' | 'caution' | 'harmful' | 'unknown'
  health_concerns: string[]
  country_status: Record<string, string>
}

type Scan = {
  id: string
  label: string | null
  safety_score: number
  created_at: string
  raw_ocr_text: string
  ingredient_ids: string[]
}

export default function ResultsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>()
  const router = useRouter()
  const [scan, setScan] = useState<Scan | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [labelModal, setLabelModal] = useState(false)
  const [labelText, setLabelText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [scanId])

  async function fetchResults() {
    try {
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single()

      if (scanError) throw scanError
      setScan(scanData)
      setLabelText(scanData.label || '')

      if (scanData.ingredient_ids?.length > 0) {
        const { data: ingredientData, error: ingredientError } = await supabase
          .from('ingredients')
          .select('*')
          .in('id', scanData.ingredient_ids)

        if (ingredientError) throw ingredientError
        
        // Sort: harmful first, then caution, then safe
        const sorted = (ingredientData || []).sort((a, b) => {
          const order = { harmful: 0, caution: 1, unknown: 2, safe: 3 }
          return (order[a.safety_level as keyof typeof order] ?? 2) -
                 (order[b.safety_level as keyof typeof order] ?? 2)
        })
        setIngredients(sorted)
      }
    } catch (e: any) {
      Alert.alert('Error', e.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  async function saveLabel() {
    if (!labelText.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('scans')
      .update({ label: labelText.trim() })
      .eq('id', scanId)
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setScan(prev => prev ? { ...prev, label: labelText.trim() } : prev)
      setLabelModal(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#00E5A0'
    if (score >= 45) return '#EF9F27'
    return '#E24B4A'
  }

  const getSafetyColor = (level: string) => {
    const colors = { safe: '#00E5A0', caution: '#EF9F27', harmful: '#E24B4A', unknown: '#555' }
    return colors[level as keyof typeof colors] || '#555'
  }

  const getSafetyLabel = (level: string) => {
    const labels = { safe: 'Safe', caution: 'Caution', harmful: 'Harmful', unknown: 'Unknown' }
    return labels[level as keyof typeof labels] || 'Unknown'
  }

  const getBannedCount = () => {
    return ingredients.filter(i =>
      Object.values(i.country_status || {}).includes('banned')
    ).length
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00E5A0" size="large" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    )
  }

  if (!scan) return null

  const scoreColor = getScoreColor(scan.safety_score)
  const bannedCount = getBannedCount()
  const harmfulCount = ingredients.filter(i => i.safety_level === 'harmful').length
  const cautionCount = ingredients.filter(i => i.safety_level === 'caution').length
  const safeCount = ingredients.filter(i => i.safety_level === 'safe').length

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.labelButton}
            onPress={() => setLabelModal(true)}
          >
            <Text style={styles.labelButtonText} numberOfLines={1}>
              {scan.label || 'Name this scan'}
            </Text>
            <Text style={styles.labelButtonIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreTitle}>Safety score</Text>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {scan.safety_score}
            </Text>
            <Text style={styles.scoreDate}>{formatDate(scan.created_at)}</Text>
          </View>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreRingNumber, { color: scoreColor }]}>
              {scan.safety_score}
            </Text>
            <Text style={[styles.scoreRingLabel, { color: scoreColor }]}>
              {scan.safety_score >= 75 ? 'Safe' : scan.safety_score >= 45 ? 'Caution' : 'Harmful'}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#E24B4A' }]}>{harmfulCount}</Text>
            <Text style={styles.statLbl}>Harmful</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#EF9F27' }]}>{cautionCount}</Text>
            <Text style={styles.statLbl}>Caution</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#00E5A0' }]}>{safeCount}</Text>
            <Text style={styles.statLbl}>Safe</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#E24B4A' }]}>{bannedCount}</Text>
            <Text style={styles.statLbl}>Banned</Text>
          </View>
        </View>

        {/* Country ban alert */}
        {bannedCount > 0 && (
          <View style={styles.banAlert}>
            <Text style={styles.banAlertIcon}>🌍</Text>
            <Text style={styles.banAlertText}>
              {bannedCount} ingredient{bannedCount > 1 ? 's are' : ' is'} banned in at least one country
            </Text>
          </View>
        )}

        {/* Ingredients list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ingredients ({ingredients.length})
          </Text>
          {ingredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient.id}
              style={styles.ingredientCard}
              onPress={() => router.push(`/ingredient/${ingredient.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.ingredientTop}>
                <View style={styles.ingredientLeft}>
                  <Text style={styles.ingredientName}>
                    {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1)}
                  </Text>
                  <Text style={styles.ingredientCategory}>{ingredient.category}</Text>
                </View>
                <View style={[
                  styles.safetyBadge,
                  { backgroundColor: `${getSafetyColor(ingredient.safety_level)}15` }
                ]}>
                  <Text style={[
                    styles.safetyBadgeText,
                    { color: getSafetyColor(ingredient.safety_level) }
                  ]}>
                    {getSafetyLabel(ingredient.safety_level)}
                  </Text>
                </View>
              </View>
              <Text style={styles.ingredientDesc} numberOfLines={2}>
                {ingredient.description}
              </Text>
              {ingredient.health_concerns?.length > 0 && (
                <View style={styles.concernsRow}>
                  <Text style={styles.concernsLabel}>⚠️ </Text>
                  <Text style={styles.concernsText} numberOfLines={1}>
                    {ingredient.health_concerns[0]}
                  </Text>
                </View>
              )}
              <View style={styles.ingredientFooter}>
                <Text style={styles.viewDetail}>View details →</Text>
                {Object.values(ingredient.country_status || {}).includes('banned') && (
                  <View style={styles.bannedChip}>
                    <Text style={styles.bannedChipText}>🚫 Banned in some countries</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Label modal */}
      <Modal visible={labelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Name this scan</Text>
            <Text style={styles.modalLabel}>Product name</Text>
            <TextInput
              style={styles.modalInput}
              value={labelText}
              onChangeText={setLabelText}
              placeholder="e.g. Lays Classic, Coca Cola..."
              placeholderTextColor="#333"
              autoFocus
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.modalButton, saving && { opacity: 0.6 }]}
              onPress={saveLabel}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#080808" />
                : <Text style={styles.modalButtonText}>Save name</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setLabelModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  loading: {
    flex: 1, backgroundColor: '#080808',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  loadingText: { fontSize: 14, color: '#555' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, marginBottom: 20,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff' },
  labelButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', gap: 8, paddingLeft: 16,
  },
  labelButtonText: {
    fontSize: 15, fontWeight: '600', color: '#fff',
    maxWidth: 200,
  },
  labelButtonIcon: { fontSize: 14 },
  scoreCard: {
    marginHorizontal: 24, backgroundColor: '#111',
    borderRadius: 20, borderWidth: 1, borderColor: '#1a1a1a',
    padding: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreLeft: { gap: 4 },
  scoreTitle: { fontSize: 13, color: '#555', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreNumber: { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  scoreDate: { fontSize: 12, color: '#333', marginTop: 4 },
  scoreRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
  },
  scoreRingNumber: { fontSize: 24, fontWeight: '800' },
  scoreRingLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 24,
    backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a',
    paddingVertical: 16, marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: '#1a1a1a' },
  banAlert: {
    marginHorizontal: 24, backgroundColor: '#E24B4A15',
    borderWidth: 1, borderColor: '#E24B4A30',
    borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 24,
  },
  banAlertIcon: { fontSize: 18 },
  banAlertText: { fontSize: 13, color: '#E24B4A', flex: 1, lineHeight: 20 },
  section: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  ingredientCard: {
    backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a',
    padding: 16, marginBottom: 10, gap: 8,
  },
  ingredientTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12,
  },
  ingredientLeft: { flex: 1, gap: 3 },
  ingredientName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ingredientCategory: { fontSize: 12, color: '#555' },
  safetyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  safetyBadgeText: { fontSize: 11, fontWeight: '700' },
  ingredientDesc: { fontSize: 13, color: '#555', lineHeight: 20 },
  concernsRow: { flexDirection: 'row', alignItems: 'center' },
  concernsLabel: { fontSize: 12 },
  concernsText: { fontSize: 12, color: '#EF9F27', flex: 1 },
  ingredientFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4,
  },
  viewDetail: { fontSize: 12, color: '#00E5A0', fontWeight: '600' },
  bannedChip: {
    backgroundColor: '#E24B4A15', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6,
  },
  bannedChipText: { fontSize: 10, color: '#E24B4A' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#111', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#1a1a1a',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333', alignSelf: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 20 },
  modalLabel: {
    fontSize: 12, color: '#888', fontWeight: '500',
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#222',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#fff', marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  modalButtonText: { fontSize: 16, fontWeight: '700', color: '#080808' },
  modalCancel: { alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 15, color: '#555' },
})