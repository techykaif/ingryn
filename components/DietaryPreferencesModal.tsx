import { useState, useEffect, useRef } from 'react'
import {
   View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, useWindowDimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useDietaryPreferences, DietaryPreferences } from '@/hooks/useDietaryPreferences'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import { X, CheckCircle, Warning } from 'phosphor-react-native'

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', icon: '🩸' },
  { id: 'hypertension', label: 'Hypertension', icon: '❤️' },
  { id: 'celiac', label: 'Celiac disease', icon: '🌾' },
  { id: 'ibs', label: 'IBS', icon: '🫁' },
  { id: 'kidney_disease', label: 'Kidney disease', icon: '🫘' },
  { id: 'heart_disease', label: 'Heart disease', icon: '💓' },
  { id: 'liver_disease', label: 'Liver disease', icon: '🫀' },
  { id: 'pregnancy', label: 'Pregnancy', icon: '🤰' },
]

const ALLERGIES = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'nuts', label: 'Tree nuts', icon: '🥜' },
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'sulphites', label: 'Sulphites', icon: '🍷' },
  { id: 'sesame', label: 'Sesame', icon: '🌱' },
]

const DIET_TYPES = [
  { id: 'none', label: 'No preference' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

type Props = {
  visible: boolean
  onClose: () => void
}

export function DietaryPreferencesModal({ visible, onClose }: Props) {
  const { preferences, loading, saving, savePreferences, errorMsg } = useDietaryPreferences()
  const { height: windowHeight } = useWindowDimensions()
  const [local, setLocal] = useState<DietaryPreferences>({
    conditions: [],
    allergies: [],
    diet_type: 'none',
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (visible) { setLocal(preferences); setSaveStatus('idle') }
  }, [visible, preferences])

  function toggleCondition(id: string) {
    setSaveStatus('idle')
    setLocal(prev => ({
      ...prev,
      conditions: prev.conditions.includes(id)
        ? prev.conditions.filter(c => c !== id)
        : [...prev.conditions, id],
    }))
  }

  function toggleAllergy(id: string) {
    setSaveStatus('idle')
    setLocal(prev => ({
      ...prev,
      allergies: prev.allergies.includes(id)
        ? prev.allergies.filter(a => a !== id)
        : [...prev.allergies, id],
    }))
  }

  function setDietType(id: string) {
    setSaveStatus('idle')
    setLocal(prev => ({ ...prev, diet_type: id }))
  }

  async function handleSave() {
    const success = await savePreferences(local)
    if (success) {
      setSaveStatus('success')
      timeoutRef.current = setTimeout(() => { setSaveStatus('idle'); onClose() }, 1200)
    } else {
      setSaveStatus('error')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: windowHeight * 0.92 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Dietary preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={Colors.textSecondary} weight="bold" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            INGRYN will flag ingredients that may affect your health conditions or trigger your allergies.
          </Text>

          {/* Inline status banners */}
          {saveStatus === 'success' && (
            <View style={styles.successBanner}>
              <CheckCircle size={16} color={Colors.success} weight="fill" />
              <Text style={styles.successText}>Preferences saved successfully</Text>
            </View>
          )}
          {(saveStatus === 'error' || errorMsg) ? (
            <View style={styles.errorBanner}>
              <Warning size={16} color={Colors.danger} weight="fill" />
              <Text style={styles.errorText}>{errorMsg || 'Could not save. Please try again.'}</Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.sectionTitle}>Health conditions</Text>
              <View style={styles.grid}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, local.conditions.includes(c.id) && styles.chipActive]}
                    onPress={() => toggleCondition(c.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipIcon}>{c.icon}</Text>
                    <Text style={[styles.chipLabel, local.conditions.includes(c.id) && styles.chipLabelActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Allergies & intolerances</Text>
              <View style={styles.grid}>
                {ALLERGIES.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, local.allergies.includes(a.id) && styles.chipActiveRed]}
                    onPress={() => toggleAllergy(a.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipIcon}>{a.icon}</Text>
                    <Text style={[styles.chipLabel, local.allergies.includes(a.id) && styles.chipLabelActiveRed]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Diet type</Text>
              <View style={styles.dietGrid}>
                {DIET_TYPES.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dietChip, local.diet_type === d.id && styles.dietChipActive]}
                    onPress={() => setDietType(d.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dietChipLabel, local.diet_type === d.id && styles.dietChipLabelActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 16 }} />
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Save preferences</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 40,
    ...Shadows.lg,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontFamily: Fonts.bold, fontSize: FontSizes['2xl'], color: Colors.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  description: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.successLight, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12 },
  successText: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.success },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12 },
  errorText: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: 8 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: FontSizes.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 9, borderRadius: Radius.xl },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: `${Colors.primary}50` },
  chipActiveRed: { backgroundColor: Colors.dangerLight, borderColor: `${Colors.danger}40` },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.textSecondary },
  chipLabelActive: { color: Colors.primary },
  chipLabelActiveRed: { color: Colors.danger },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dietChip: { backgroundColor: Colors.surfaceSecondary, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full },
  dietChipActive: { backgroundColor: Colors.primaryLight, borderColor: `${Colors.primary}50` },
  dietChipLabel: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.textSecondary },
  dietChipLabelActive: { fontFamily: Fonts.semibold, color: Colors.primary },
  saveBtn: { marginTop: 12, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.primary },
  saveBtnGradient: { paddingVertical: Spacing.xl, alignItems: 'center' },
  saveBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
})