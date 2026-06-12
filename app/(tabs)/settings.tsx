import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { DietaryPreferencesModal } from '@/components/DietaryPreferencesModal'

export default function SettingsScreen() {
  const { user } = useAuthStore()
  const [signingOut, setSigningOut] = useState(false)
  const [editNameModal, setEditNameModal] = useState(false)
  const [changePasswordModal, setChangePasswordModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [dietaryModal, setDietaryModal] = useState(false)

  const fullName = user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSignOut() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true)
            await supabase.auth.signOut()
            setSigningOut(false)
          }
        }
      ]
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
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="👤"
              label="Full name"
              value={fullName}
              onPress={() => setEditNameModal(true)}
              showArrow
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="✉️"
              label="Email"
              value={email}
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="🔑"
              label="Change password"
              onPress={() => setChangePasswordModal(true)}
              showArrow
            />
          </View>
        </View>

        {/* Health section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Health</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="🥗"
              label="Dietary preferences"
              value="Manage"
              onPress={() => setDietaryModal(true)}
              showArrow
            />
          </View>

        </View>
        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="📊"
              label="App version"
              value="1.0.0"
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="📊"
              label="Scans"
              value="Unlimited"
            />
          </View>
        </View>

        {/* Legal section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legal</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="📄"
              label="Privacy policy"
              showArrow
              onPress={() => Alert.alert('Coming soon')}
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="📋"
              label="Terms of service"
              showArrow
              onPress={() => Alert.alert('Coming soon')}
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Danger zone</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="🗑"
              label="Delete account"
              labelStyle={{ color: '#E24B4A' }}
              onPress={() => setDeleteModal(true)}
              showArrow
            />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color="#E24B4A" />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>INGRYN · Know what's inside.</Text>
      </ScrollView>

      {/* Edit name modal */}
      <EditNameModal
        visible={editNameModal}
        currentName={fullName}
        onClose={() => setEditNameModal(false)}
      />

      {/* Change password modal */}
      <ChangePasswordModal
        visible={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
      />

      {/* Delete account modal */}
      <DeleteAccountModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
      />
      <DietaryPreferencesModal
        visible={dietaryModal}
        onClose={() => setDietaryModal(false)}
      />
    </View>
  )
}

// ── Edit Name Modal ──
function EditNameModal({
  visible, currentName, onClose
}: { visible: boolean; currentName: string; onClose: () => void }) {
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() }
    })
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      if (data.user) setUser(data.user)
      Alert.alert('Success', 'Name updated successfully')
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Edit name</Text>
          <Text style={modalStyles.label}>Full name</Text>
          <TextInput
            style={modalStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#333"
            autoCapitalize="words"
            autoFocus
          />
          <TouchableOpacity
            style={[modalStyles.primaryButton, loading && modalStyles.disabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#080808" />
              : <Text style={modalStyles.primaryButtonText}>Save changes</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// ── Change Password Modal ──
function ChangePasswordModal({
  visible, onClose
}: { visible: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    if (!newPass || !confirm) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (newPass.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }
    if (newPass !== confirm) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Password updated successfully')
      setCurrent('')
      setNewPass('')
      setConfirm('')
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Change password</Text>
          <Text style={modalStyles.label}>New password</Text>
          <TextInput
            style={modalStyles.input}
            value={newPass}
            onChangeText={setNewPass}
            placeholder="Min. 6 characters"
            placeholderTextColor="#333"
            secureTextEntry
            autoCapitalize="none"
            autoFocus
          />
          <Text style={modalStyles.label}>Confirm new password</Text>
          <TextInput
            style={[modalStyles.input, { marginBottom: 24 }]}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat new password"
            placeholderTextColor="#333"
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[modalStyles.primaryButton, loading && modalStyles.disabled]}
            onPress={handleChange}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#080808" />
              : <Text style={modalStyles.primaryButtonText}>Update password</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// ── Delete Account Modal ──
function DeleteAccountModal({
  visible, onClose
}: { visible: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm !== 'DELETE') {
      Alert.alert('Error', 'Type DELETE to confirm')
      return
    }
    setLoading(true)
    const { error } = await supabase.rpc('delete_user')
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      await supabase.auth.signOut()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Delete account</Text>
          <Text style={modalStyles.deleteWarning}>
            This will permanently delete your account and all scan history. This action cannot be undone.
          </Text>
          <Text style={modalStyles.label}>Type DELETE to confirm</Text>
          <TextInput
            style={modalStyles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="DELETE"
            placeholderTextColor="#333"
            autoCapitalize="characters"
            autoFocus
          />
          <TouchableOpacity
            style={[modalStyles.deleteButton, loading && modalStyles.disabled]}
            onPress={handleDelete}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={modalStyles.deleteButtonText}>Delete my account</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  )
}

// ── Settings Row ──
function SettingsRow({
  icon, label, value, onPress, showArrow, labelStyle
}: {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  showArrow?: boolean
  labelStyle?: object
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, labelStyle]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && <Text style={styles.rowArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  bgCircle: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: 150, backgroundColor: '#00E5A006',
    top: -80, right: -80,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#fff' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, backgroundColor: '#111',
    borderRadius: 16, borderWidth: 1, borderColor: '#1a1a1a',
    padding: 16, marginBottom: 28, gap: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#00E5A015', borderWidth: 1,
    borderColor: '#00E5A030', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#00E5A0' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileEmail: { fontSize: 13, color: '#444' },
  section: { paddingHorizontal: 24, marginBottom: 24, gap: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#444',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: '#111', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a1a', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15, gap: 12,
  },
  rowDivider: { height: 1, backgroundColor: '#1a1a1a', marginLeft: 44 },
  rowIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: '#ccc', fontWeight: '400' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: '#444' },
  rowArrow: { fontSize: 18, color: '#333' },
  signOutButton: {
    marginHorizontal: 24, backgroundColor: '#E24B4A15',
    borderWidth: 1, borderColor: '#E24B4A30',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 24,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#E24B4A' },
  footer: { textAlign: 'center', fontSize: 12, color: '#222', marginBottom: 12 },
})

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#1a1a1a',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333', alignSelf: 'center', marginBottom: 24,
  },
  title: {
    fontSize: 22, fontWeight: '700',
    color: '#fff', marginBottom: 20,
  },
  label: {
    fontSize: 12, color: '#888', fontWeight: '500',
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1,
    borderColor: '#222', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#fff', marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#080808' },
  deleteButton: {
    backgroundColor: '#E24B4A', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelButton: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15, color: '#555' },
  disabled: { opacity: 0.6 },
  deleteWarning: {
    fontSize: 14, color: '#E24B4A',
    lineHeight: 22, marginBottom: 20,
    backgroundColor: '#E24B4A15', padding: 12,
    borderRadius: 10,
  },
})