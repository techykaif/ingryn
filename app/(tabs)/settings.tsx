import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'

export default function SettingsScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [signingOut, setSigningOut] = useState(false)

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
        {/* Header */}
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
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        </View>

        {/* Subscription banner */}
        <TouchableOpacity style={styles.proBanner} activeOpacity={0.85}>
          <View style={styles.proBannerLeft}>
            <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
            <Text style={styles.proBannerSubtitle}>
              Unlimited scans · Country bans · Full AI analysis
            </Text>
          </View>
          <Text style={styles.proBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="👤"
              label="Full name"
              value={fullName}
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
              onPress={() => Alert.alert('Coming soon', 'Password change will be available soon.')}
              showArrow
            />
          </View>
        </View>

        {/* Subscription section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subscription</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="⭐"
              label="Current plan"
              value="Free"
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="🔄"
              label="Restore purchases"
              onPress={() => Alert.alert('No purchases found', 'No previous purchases were found for this account.')}
              showArrow
            />
          </View>
        </View>

        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="🔔"
              label="Notifications"
              value="Coming soon"
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="🌍"
              label="Country ban region"
              value="Global"
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="📊"
              label="App version"
              value="1.0.0"
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
    </View>
  )
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow,
}: {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  showArrow?: boolean
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && <Text style={styles.rowArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  bgCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00E5A006',
    top: -80,
    right: -80,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00E5A015',
    borderWidth: 1,
    borderColor: '#00E5A030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00E5A0',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 13,
    color: '#444',
  },
  freeBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
  },
  proBanner: {
    marginHorizontal: 24,
    backgroundColor: '#00E5A0',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  proBannerLeft: {
    flex: 1,
    gap: 4,
  },
  proBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#080808',
  },
  proBannerSubtitle: {
    fontSize: 12,
    color: '#08080870',
  },
  proBannerArrow: {
    fontSize: 20,
    color: '#080808',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginLeft: 44,
  },
  rowIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#ccc',
    fontWeight: '400',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    color: '#444',
  },
  rowArrow: {
    fontSize: 18,
    color: '#333',
  },
  signOutButton: {
    marginHorizontal: 24,
    backgroundColor: '#E24B4A15',
    borderWidth: 1,
    borderColor: '#E24B4A30',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E24B4A',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#222',
    marginBottom: 12,
  },
})