import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/emailValidator'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  ArrowLeft, EnvelopeSimple, Lock, Eye, EyeSlash,
  Warning, CheckCircle, ArrowRight, Leaf
} from 'phosphor-react-native'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 1000
const BACKOFF_MULTIPLIER = 2

function getAuthErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? ''
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Incorrect email or password. Please try again.'
  if (msg.includes('email not confirmed'))
    return 'Please verify your email before signing in. Check your inbox.'
  if (msg.includes('user not found') || msg.includes('no user found'))
    return 'No account found with this email address.'
  if (msg.includes('too many requests') || error.status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network error. Please check your connection.'
  return `Sign in failed: ${error.message}`
}

export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Forgot password
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')

  // Rate limiting
  const attempts = useRef(0)
  const lockoutUntil = useRef<number | null>(null)
  const lockoutCount = useRef(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function startLockoutCountdown(ms: number) {
    const seconds = Math.ceil(ms / 1000)
    setLockoutSeconds(seconds)
    lockoutTimer.current = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) { clearInterval(lockoutTimer.current!); lockoutTimer.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function isLockedOut(): boolean {
    if (lockoutUntil.current && Date.now() < lockoutUntil.current) return true
    if (lockoutUntil.current && Date.now() >= lockoutUntil.current) lockoutUntil.current = null
    return false
  }

  async function handleSignIn() {
    setErrorMsg('')
    if (!email || !password) { setErrorMsg('Please enter your email and password.'); return }
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) { setErrorMsg(emailCheck.reason); return }
    if (isLockedOut()) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      attempts.current += 1
      if (attempts.current >= MAX_ATTEMPTS) {
        lockoutCount.current += 1
        const lockoutMs = LOCKOUT_DURATION_MS * Math.pow(BACKOFF_MULTIPLIER, lockoutCount.current - 1)
        lockoutUntil.current = Date.now() + lockoutMs
        attempts.current = 0
        startLockoutCountdown(lockoutMs)
        setErrorMsg(`Too many failed attempts. Try again in ${Math.ceil(lockoutMs / 1000)} seconds.`)
        return
      }
      const remaining = MAX_ATTEMPTS - attempts.current
      const base = getAuthErrorMessage(error)
      setErrorMsg(remaining <= 2 ? `${base} ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` : base)
    } else {
      attempts.current = 0; lockoutCount.current = 0; lockoutUntil.current = null
      router.replace('/(tabs)/home')
    }
  }

  async function handleForgotPassword() {
    setResetError('')
    if (!resetEmail.trim()) { setResetError('Please enter your email address.'); return }
    const emailCheck = validateEmail(resetEmail)
    if (!emailCheck.valid) { setResetError(emailCheck.reason); return }
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'ingryn://reset-password',
    })
    setResetLoading(false)
    if (error) setResetError(getAuthErrorMessage(error))
    else setResetSent(true)
  }

  // ─── Forgot password mode ─────────────────────────────────────────
  if (forgotMode) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="dark" />
        <View style={styles.blob1} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { setForgotMode(false); setResetSent(false); setResetEmail(''); setResetError('') }}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={Colors.textPrimary} weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {resetSent ? (
            <View style={styles.successContainer}>
              <View style={[styles.successIconBox, Shadows.primary]}>
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.successIconGradient}>
                  <CheckCircle size={36} color="#fff" weight="fill" />
                </LinearGradient>
              </View>
              <Text style={styles.pageTitle}>Check your inbox</Text>
              <Text style={styles.pageSubtitle}>
                We sent a reset link to{'\n'}
                <Text style={styles.emailHighlight}>{resetEmail}</Text>
              </Text>
              <Text style={styles.resetHint}>Didn't get it? Check your spam folder.</Text>
              <TouchableOpacity style={[styles.primaryBtnWrapper, Shadows.primary]} onPress={() => setResetSent(false)}>
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Resend email</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>Back to <Text style={styles.linkBtnHighlight}>Sign in</Text></Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.pageTitle}>Reset password</Text>
              <Text style={styles.pageSubtitle}>Enter your email and we'll send you a reset link.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, resetError ? styles.inputError : null, Shadows.sm]}>
                  <EnvelopeSimple size={18} color={Colors.textTertiary} weight="regular" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={resetEmail}
                    onChangeText={t => { setResetEmail(t); setResetError('') }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {resetError ? (
                <View style={styles.errorBanner}>
                  <Warning size={14} color={Colors.danger} weight="fill" />
                  <Text style={styles.errorBannerText}>{resetError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtnWrapper, resetLoading && styles.btnDisabled, Shadows.primary]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
                activeOpacity={0.9}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                  {resetLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send reset link</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setForgotMode(false)} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>Back to <Text style={styles.linkBtnHighlight}>Sign in</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ─── Sign in mode ─────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.textPrimary} weight="bold" />
        </TouchableOpacity>
        <View style={styles.logoMini}>
          <Leaf size={16} color={Colors.primary} weight="fill" />
          <Text style={styles.logoMiniText}>INGRYN</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Welcome back</Text>
        <Text style={styles.pageSubtitle}>Sign in to your account</Text>

        <View style={styles.form}>
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
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={() => { setForgotMode(true); setResetEmail(email) }}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, errorMsg ? styles.inputError : null, Shadows.sm]}>
              <Lock size={18} color={Colors.textTertiary} weight="regular" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={t => { setPassword(t); setErrorMsg('') }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPassword
                  ? <EyeSlash size={18} color={Colors.textTertiary} weight="regular" />
                  : <Eye size={18} color={Colors.textTertiary} weight="regular" />
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error banner */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Warning size={14} color={Colors.danger} weight="fill" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Lockout banner */}
        {lockoutSeconds > 0 && (
          <View style={styles.lockoutBanner}>
            <Lock size={14} color={Colors.caution} weight="fill" />
            <Text style={styles.lockoutText}>Too many attempts. Try again in {lockoutSeconds}s</Text>
          </View>
        )}

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.primaryBtnWrapper, (loading || lockoutSeconds > 0) && styles.btnDisabled, Shadows.primary]}
          onPress={handleSignIn}
          disabled={loading || lockoutSeconds > 0}
          activeOpacity={0.9}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.primaryBtnText}>
                    {lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Sign In'}
                  </Text>
                  {!lockoutSeconds && <ArrowRight size={18} color="#fff" weight="bold" />}
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google button */}
        <TouchableOpacity style={[styles.googleBtn, Shadows.sm]} activeOpacity={0.8}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>
            Don't have an account? <Text style={styles.linkBtnHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: `${Colors.primary}10`, top: -100, right: -80 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: `${Colors.primary}08`, bottom: 60, left: -60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingHorizontal: Spacing['2xl'], marginBottom: Spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  logoMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoMiniText: { fontFamily: Fonts.extrabold, fontSize: FontSizes.sm, color: Colors.textPrimary, letterSpacing: 3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: 48 },
  pageTitle: { fontFamily: Fonts.extrabold, fontSize: FontSizes['5xl'], color: Colors.textPrimary, marginBottom: 8 },
  pageSubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, marginBottom: Spacing['3xl'] },
  form: { gap: Spacing.xl, marginBottom: Spacing.xl },
  inputGroup: { gap: Spacing.sm },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputLabel: { fontFamily: Fonts.semibold, fontSize: FontSizes.sm, color: Colors.textSecondary },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  inputError: { borderColor: Colors.danger },
  input: { flex: 1, fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textPrimary, paddingVertical: Spacing.lg, padding: 0 },
  forgotLink: { fontFamily: Fonts.semibold, fontSize: FontSizes.sm, color: Colors.primary },
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  errorBannerText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger, lineHeight: 18 },
  lockoutBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.warningLight, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  lockoutText: { fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.caution },
  primaryBtnWrapper: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  btnDisabled: { opacity: 0.5 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.xl },
  primaryBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textTertiary },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl, paddingVertical: Spacing.lg, gap: 12, marginBottom: Spacing.xl },
  googleIcon: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: Colors.textPrimary },
  googleText: { fontFamily: Fonts.medium, fontSize: FontSizes.base, color: Colors.textSecondary },
  linkBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkBtnText: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary },
  linkBtnHighlight: { fontFamily: Fonts.bold, color: Colors.primary },
  // Forgot mode
  successContainer: { alignItems: 'center', paddingTop: Spacing.xl, gap: Spacing.lg },
  successIconBox: { borderRadius: 28, overflow: 'hidden', marginBottom: Spacing.md },
  successIconGradient: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  emailHighlight: { fontFamily: Fonts.bold, color: Colors.primary },
  resetHint: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },
})