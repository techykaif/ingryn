import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { useDietaryPreferences, DietaryPreferences } from '@/hooks/useDietaryPreferences'

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
  const { preferences, loading, saving, savePreferences } = useDietaryPreferences()
  const [local, setLocal] = useState<DietaryPreferences>({
    conditions: [],
    allergies: [],
    diet_type: 'none',
  })

  useEffect(() => {
    if (visible) setLocal(preferences)
  }, [visible, preferences])

  function toggleCondition(id: string) {
    setLocal(prev => ({
      ...prev,
      conditions: prev.conditions.includes(id)
        ? prev.conditions.filter(c => c !== id)
        : [...prev.conditions, id],
    }))
  }

  function toggleAllergy(id: string) {
    setLocal(prev => ({
      ...prev,
      allergies: prev.allergies.includes(id)
        ? prev.allergies.filter(a => a !== id)
        : [...prev.allergies, id],
    }))
  }

  function setDietType(id: string) {
    setLocal(prev => ({ ...prev, diet_type: id }))
  }

  async function handleSave() {
    const success = await savePreferences(local)
    if (success) {
      Alert.alert('Saved', 'Your dietary preferences have been updated.')
      onClose()
    } else {
      Alert.alert('Error', 'Could not save preferences. Please try again.')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Dietary preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            INGRYN will flag ingredients that may affect your health conditions or trigger your allergies.
          </Text>

          {loading ? (
            <ActivityIndicator color="#00E5A0" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Health conditions */}
              <Text style={styles.sectionTitle}>Health conditions</Text>
              <View style={styles.grid}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      local.conditions.includes(c.id) && styles.chipActive
                    ]}
                    onPress={() => toggleCondition(c.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipIcon}>{c.icon}</Text>
                    <Text style={[
                      styles.chipLabel,
                      local.conditions.includes(c.id) && styles.chipLabelActive
                    ]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Allergies */}
              <Text style={styles.sectionTitle}>Allergies & intolerances</Text>
              <View style={styles.grid}>
                {ALLERGIES.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.chip,
                      local.allergies.includes(a.id) && styles.chipActiveRed
                    ]}
                    onPress={() => toggleAllergy(a.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipIcon}>{a.icon}</Text>
                    <Text style={[
                      styles.chipLabel,
                      local.allergies.includes(a.id) && styles.chipLabelActiveRed
                    ]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Diet type */}
              <Text style={styles.sectionTitle}>Diet type</Text>
              <View style={styles.dietGrid}>
                {DIET_TYPES.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.dietChip,
                      local.diet_type === d.id && styles.dietChipActive
                    ]}
                    onPress={() => setDietType(d.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.dietChipLabel,
                      local.diet_type === d.id && styles.dietChipLabelActive
                    ]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#080808" />
              : <Text style={styles.saveBtnText}>Save preferences</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    maxHeight: '90%',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333', alignSelf: 'center',
    marginTop: 12, marginBottom: 20,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1a1a1a', alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: '#555' },
  description: {
    fontSize: 14, color: '#555',
    lineHeight: 22, marginBottom: 24,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: '#888',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 12, marginTop: 8,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 24,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: '#222',
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#00E5A015',
    borderColor: '#00E5A040',
  },
  chipActiveRed: {
    backgroundColor: '#E24B4A15',
    borderColor: '#E24B4A40',
  },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipLabelActive: { color: '#00E5A0' },
  chipLabelActiveRed: { color: '#E24B4A' },
  dietGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 24,
  },
  dietChip: {
    backgroundColor: '#1a1a1a', borderWidth: 1,
    borderColor: '#222', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 20,
  },
  dietChipActive: {
    backgroundColor: '#00E5A015',
    borderColor: '#00E5A040',
  },
  dietChipLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  dietChipLabelActive: { color: '#00E5A0', fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#080808' },
})