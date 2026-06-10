import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
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
  last_updated: string
}

const COUNTRIES: Record<string, { flag: string; label: string }> = {
  US:        { flag: '🇺🇸', label: 'United States' },
  EU:        { flag: '🇪🇺', label: 'European Union' },
  UK:        { flag: '🇬🇧', label: 'United Kingdom' },
  India:     { flag: '🇮🇳', label: 'India' },
  Australia: { flag: '🇦🇺', label: 'Australia' },
  Canada:    { flag: '🇨🇦', label: 'Canada' },
  Japan:     { flag: '🇯🇵', label: 'Japan' },
  China:     { flag: '🇨🇳', label: 'China' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  permitted:              { label: 'Permitted',         color: '#00E5A0', bg: '#00E5A015' },
  permitted_with_limits:  { label: 'Limited use',       color: '#EF9F27', bg: '#EF9F2715' },
  banned:                 { label: 'Banned',            color: '#E24B4A', bg: '#E24B4A15' },
  under_review:           { label: 'Under review',      color: '#8B8BFF', bg: '#8B8BFF15' },
  no_data:                { label: 'No data',           color: '#444',    bg: '#1a1a1a' },
}

const SAFETY_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  safe:    { label: 'Safe',    color: '#00E5A0', bg: '#00E5A015', desc: 'Generally recognized as safe by major health authorities.' },
  caution: { label: 'Caution', color: '#EF9F27', bg: '#EF9F2715', desc: 'May cause issues for some people. Use in moderation.' },
  harmful: { label: 'Harmful', color: '#E24B4A', bg: '#E24B4A15', desc: 'Linked to health concerns. Avoid where possible.' },
  unknown: { label: 'Unknown', color: '#555',    bg: '#1a1a1a',   desc: 'Insufficient data to determine safety level.' },
}

export default function IngredientDetailScreen() {
  const { ingredientId } = useLocalSearchParams<{ ingredientId: string }>()
  const router = useRouter()
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIngredient()
  }, [ingredientId])

  async function fetchIngredient() {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', ingredientId)
        .single()
      if (error) throw error
      setIngredient(data)
    } catch (e: any) {
      Alert.alert('Error', e.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00E5A0" size="large" />
      </View>
    )
  }

  if (!ingredient) return null

  const safety = SAFETY_CONFIG[ingredient.safety_level] || SAFETY_CONFIG.unknown
  const bannedIn = Object.entries(ingredient.country_status || {}).filter(([, v]) => v === 'banned')
  const restrictedIn = Object.entries(ingredient.country_status || {}).filter(([, v]) => v === 'permitted_with_limits')

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgCircle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Text style={styles.categoryChip}>{ingredient.category}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.name}>
            {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1)}
          </Text>
          {ingredient.aliases?.length > 0 && (
            <Text style={styles.aliases}>
              Also known as: {ingredient.aliases.slice(0, 4).join(', ')}
            </Text>
          )}
        </View>

        {/* Safety card */}
        <View style={[styles.safetyCard, { borderColor: safety.color + '30', backgroundColor: safety.bg }]}>
          <View style={styles.safetyLeft}>
            <Text style={[styles.safetyLabel, { color: safety.color }]}>{safety.label}</Text>
            <Text style={styles.safetyDesc}>{safety.desc}</Text>
          </View>
          <View style={[styles.safetyBadge, { backgroundColor: safety.color }]}>
            <Text style={styles.safetyBadgeText}>
              {ingredient.safety_level === 'safe' ? '✓' :
               ingredient.safety_level === 'harmful' ? '✕' :
               ingredient.safety_level === 'caution' ? '!' : '?'}
            </Text>
          </View>
        </View>

        {/* Quick stats */}
        {(bannedIn.length > 0 || restrictedIn.length > 0) && (
          <View style={styles.quickStats}>
            {bannedIn.length > 0 && (
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: '#E24B4A' }]}>{bannedIn.length}</Text>
                <Text style={styles.quickStatLabel}>
                  {bannedIn.length === 1 ? 'country' : 'countries'}{'\n'}banned
                </Text>
              </View>
            )}
            {bannedIn.length > 0 && restrictedIn.length > 0 && (
              <View style={styles.quickStatDivider} />
            )}
            {restrictedIn.length > 0 && (
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: '#EF9F27' }]}>{restrictedIn.length}</Text>
                <Text style={styles.quickStatLabel}>
                  {restrictedIn.length === 1 ? 'country' : 'countries'}{'\n'}restricted
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.description}>{ingredient.description}</Text>
          </View>
        </View>

        {/* Health concerns */}
        {ingredient.health_concerns?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health concerns</Text>
            <View style={styles.sectionCard}>
              {ingredient.health_concerns.map((concern, i) => (
                <View key={i} style={styles.concernRow}>
                  <View style={styles.concernDot} />
                  <Text style={styles.concernText}>{concern}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Country status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulatory status by country</Text>
          <View style={styles.sectionCard}>
            {Object.entries(COUNTRIES).map(([code, { flag, label }], i) => {
              const status = ingredient.country_status?.[code] || 'no_data'
              const config = STATUS_CONFIG[status] || STATUS_CONFIG.no_data
              return (
                <View key={code}>
                  {i > 0 && <View style={styles.countryDivider} />}
                  <View style={styles.countryRow}>
                    <Text style={styles.countryFlag}>{flag}</Text>
                    <Text style={styles.countryLabel}>{label}</Text>
                    <View style={[styles.statusChip, { backgroundColor: config.bg }]}>
                      <Text style={[styles.statusChipText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Aliases */}
        {ingredient.aliases?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All names & codes</Text>
            <View style={styles.aliasesGrid}>
              {ingredient.aliases.map((alias, i) => (
                <View key={i} style={styles.aliasChip}>
                  <Text style={styles.aliasChipText}>{alias}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Information provided for educational purposes only. Not medical advice.
        </Text>
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
  scrollContent: { paddingBottom: 80 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff' },
  headerRight: { alignItems: 'flex-end' },
  categoryChip: {
    fontSize: 12, color: '#00E5A0', fontWeight: '600',
    backgroundColor: '#00E5A015', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#00E5A025',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  titleSection: { paddingHorizontal: 24, marginBottom: 20, gap: 8 },
  name: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 36 },
  aliases: { fontSize: 13, color: '#444', lineHeight: 20 },
  safetyCard: {
    marginHorizontal: 24, borderRadius: 16, borderWidth: 1,
    padding: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 16, marginBottom: 16,
  },
  safetyLeft: { flex: 1, gap: 6 },
  safetyLabel: { fontSize: 18, fontWeight: '700' },
  safetyDesc: { fontSize: 13, color: '#666', lineHeight: 20 },
  safetyBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  safetyBadgeText: { fontSize: 20, fontWeight: '800', color: '#080808' },
  quickStats: {
    marginHorizontal: 24, backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a',
    flexDirection: 'row', paddingVertical: 16, marginBottom: 16,
  },
  quickStat: { flex: 1, alignItems: 'center', gap: 4 },
  quickStatNum: { fontSize: 28, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, color: '#444', textAlign: 'center', lineHeight: 16 },
  quickStatDivider: { width: 1, backgroundColor: '#1a1a1a' },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  sectionCard: {
    backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a', overflow: 'hidden',
  },
  description: { fontSize: 15, color: '#888', lineHeight: 26, padding: 18 },
  concernRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  concernDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#EF9F27', marginTop: 7,
  },
  concernText: { flex: 1, fontSize: 14, color: '#888', lineHeight: 22 },
  countryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  countryDivider: { height: 1, backgroundColor: '#1a1a1a', marginLeft: 52 },
  countryFlag: { fontSize: 22, width: 30 },
  countryLabel: { flex: 1, fontSize: 14, color: '#ccc', fontWeight: '400' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  aliasesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aliasChip: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  aliasChipText: { fontSize: 13, color: '#555' },
  disclaimer: {
    fontSize: 11, color: '#2a2a2a', textAlign: 'center',
    paddingHorizontal: 24, lineHeight: 18, marginBottom: 8,
  },
})