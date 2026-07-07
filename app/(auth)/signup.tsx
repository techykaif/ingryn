import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Image
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/emailValidator'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  ArrowLeft, EnvelopeSimple, Lock, Eye, EyeSlash,
  Warning, ArrowRight, UserCircle, CheckCircle
} from 'phosphor-react-native'

function getSignUpErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? ''
  if (msg.includes('user already registered') || msg.includes('already exists'))
    return 'An account with this email already exists. Try signing in.'
  if (msg.includes('password') && msg.includes('short'))
    return 'Password must be at least 6 characters.'
  if (msg.includes('too many requests') || error.status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network error. Please check your connection.'
  return `Sign up failed: ${error.message}`
}

function PasswordStrength({ password }: { password: string }) {
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  const varietyScore = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
  
  let strength = 0
  if (password.length > 0) {
    if (password.length < 6) strength = 1
    else if (password.length >= 10 && varietyScore >= 3) strength = 3
    else if (varietyScore >= 2 && password.length >= 6) strength = 2
    else strength = 1
  }
  const config = [
    { color: Colors.border, label: '' },
    { color: Colors.danger, label: 'Weak' },
    { color: Colors.caution, label: 'Fair' },
    { color: Colors.safe, label: 'Strong' },
  ]
  if (!password) return null
  const { color, label } = config[strength]
  return (
    <View style={pwStyles.container}>
      <View style={pwStyles.bars}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[pwStyles.bar, { backgroundColor: i <= strength ? color : Colors.border }]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color }]}>{label}</Text>
    </View>
  )
}

const pwStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontFamily: Fonts.semibold, fontSize: FontSizes.xs, width: 44 },
})

export default function SignUpScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)

  async function handleSignUp() {
    setErrorMsg('')
    if (!fullName.trim()) { setErrorMsg('Please enter your full name.'); return }
    if (!email || !password) { setErrorMsg('Please fill in all fields.'); return }
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) { setErrorMsg(emailCheck.reason); return }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (error) {
        setErrorMsg(getSignUpErrorMessage(error))
      } else if (!data?.session) {
        // Email verification required — session is null until confirmed
        setVerificationSent(true)
      }
      // If session exists, AuthGate in _layout.tsx handles the redirect
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 12 : 24 }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.textPrimary} weight="bold" />
        </TouchableOpacity>
        <View style={styles.logoMini}>
          <Image source={require('@/assets/icon.png')} style={styles.logoMiniImage} />
          <Text style={styles.logoMiniText}>INGRYN</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Create account</Text>
        <Text style={styles.pageSubtitle}>Start scanning in seconds — it's free</Text>

        <View style={styles.form}>
          {/* Full name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full name</Text>
            <View style={[styles.inputWrapper, errorMsg && !fullName.trim() ? styles.inputError : null, Shadows.sm]}>
              <UserCircle size={18} color={Colors.textTertiary} weight="regular" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.textTertiary}
                value={fullName}
                onChangeText={t => { setFullName(t); setErrorMsg('') }}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, errorMsg ? styles.inputError : null, Shadows.sm]}>
              <EnvelopeSimple size={18} color={Colors.textTertiary} weight="regular" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={t => { setEmail(t); setErrorMsg('') }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, errorMsg ? styles.inputError : null, Shadows.sm]}>
              <Lock size={18} color={Colors.textTertiary} weight="regular" />
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={t => { setPassword(t); setErrorMsg('') }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword
                  ? <EyeSlash size={18} color={Colors.textTertiary} weight="regular" />
                  : <Eye size={18} color={Colors.textTertiary} weight="regular" />
                }
              </TouchableOpacity>
            </View>
            <PasswordStrength password={password} />
          </View>
        </View>

        {/* Verification sent banner */}
        {verificationSent ? (
          <View style={styles.successBanner}>
            <CheckCircle size={14} color={Colors.success} weight="fill" />
            <Text style={styles.successBannerText}>
              Check your email — we sent a verification link. Please verify to continue.
            </Text>
          </View>
        ) : null}

        {/* Error banner */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Warning size={14} color={Colors.danger} weight="fill" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryBtnWrapper, loading && styles.btnDisabled, Shadows.primary]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                  <ArrowRight size={18} color="#fff" weight="bold" />
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity style={[styles.googleBtn, Shadows.sm]} activeOpacity={0.8} onPress={() => setErrorMsg('Google sign-in is coming soon. Please use email and password for now.')}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/signin')}
          style={styles.linkBtn}
        >
          <Text style={styles.linkBtnText}>
            Already have an account?{' '}
            <Text style={styles.linkBtnHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By creating an account you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => router.push({ pathname: '/legal/[type]', params: { type: 'terms' } })}>
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text style={styles.legalLink} onPress={() => router.push({ pathname: '/legal/[type]', params: { type: 'privacy' } })}>
            Privacy Policy
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: `${Colors.primary}10`, top: -100, right: -80 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: `${Colors.primary}08`, bottom: 60, left: -60 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'], marginBottom: Spacing.xl,
  },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  logoMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoMiniImage: { width: 20, height: 20, borderRadius: 6 },
  logoMiniText: { fontFamily: Fonts.extrabold, fontSize: FontSizes.sm, color: Colors.textPrimary, letterSpacing: 3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: 48 },
  pageTitle: { fontFamily: Fonts.extrabold, fontSize: FontSizes['5xl'], color: Colors.textPrimary, marginBottom: 8 },
  pageSubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, marginBottom: Spacing['3xl'] },
  form: { gap: Spacing.xl, marginBottom: Spacing.xl },
  inputGroup: { gap: Spacing.sm },
  inputLabel: { fontFamily: Fonts.semibold, fontSize: FontSizes.sm, color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg, gap: Spacing.md,
  },
  inputError: { borderColor: Colors.danger },
  input: { flex: 1, fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textPrimary, paddingVertical: Spacing.lg, padding: 0 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  errorBannerText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger, lineHeight: 18 },
  successBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.successLight, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  successBannerText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.success, lineHeight: 18 },
  primaryBtnWrapper: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  btnDisabled: { opacity: 0.5 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.xl },
  primaryBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textTertiary },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.xl, paddingVertical: Spacing.lg, gap: 12, marginBottom: Spacing.xl,
  },
  googleIcon: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: Colors.textPrimary },
  googleText: { fontFamily: Fonts.medium, fontSize: FontSizes.base, color: Colors.textSecondary },
  linkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkBtnText: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary },
  linkBtnHighlight: { fontFamily: Fonts.bold, color: Colors.primary },
  legal: {
    fontFamily: Fonts.regular, fontSize: FontSizes.xs, color: Colors.textTertiary,
    textAlign: 'center', lineHeight: 18, marginTop: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  legalLink: { fontFamily: Fonts.semibold, color: Colors.primary, textDecorationLine: 'underline' },
})