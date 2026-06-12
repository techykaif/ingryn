import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/emailValidator'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 1000
const BACKOFF_MULTIPLIER = 2

function getAuthErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? ''
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before signing in. Check your inbox.'
  }
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'No account found with this email address.'
  }
  if (msg.includes('too many requests') || error.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection.'
  }
  return `Sign in failed: ${error.message}`
}

export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Forgot password state
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
        if (prev <= 1) {
          clearInterval(lockoutTimer.current!)
          lockoutTimer.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function isLockedOut(): boolean {
    if (lockoutUntil.current && Date.now() < lockoutUntil.current) return true
    if (lockoutUntil.current && Date.now() >= lockoutUntil.current) {
      lockoutUntil.current = null
    }
    return false
  }

  async function handleSignIn() {
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.')
      return
    }
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
      setErrorMsg(
        remaining <= 2
          ? `${base} ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`
          : base
      )
    } else {
      attempts.current = 0
      lockoutCount.current = 0
      lockoutUntil.current = null
      router.replace('/(tabs)/home')
    }
  }

  async function handleForgotPassword() {
    setResetError('')
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.')
      return
    }
    const emailCheck = validateEmail(resetEmail)
    if (!emailCheck.valid) {
      setResetError(emailCheck.reason)
      return
    }
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'ingryn://reset-password',
    })
    setResetLoading(false)
    if (error) {
      setResetError(getAuthErrorMessage(error))
    } else {
      setResetSent(true)
    }
  }

  // ─── Forgot password mode ─────────────────────────────────────────
  if (forgotMode) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="light" />
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { setForgotMode(false); setResetSent(false); setResetEmail(''); setResetError('') }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>INGRYN</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {resetSent ? (
            <View style={styles.resetSuccessContainer}>
              <View style={styles.resetSuccessIcon}>
                <Text style={styles.resetSuccessIconText}>✓</Text>
              </View>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                We sent a password reset link to{'\n'}
                <Text style={styles.resetEmailHighlight}>{resetEmail}</Text>
              </Text>
              <Text style={styles.resetHint}>
                Didn't get it? Check your spam folder or try again.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setResetSent(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Resend Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>
                  Back to <Text style={styles.switchHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a reset link.
              </Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#333"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {resetError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{resetError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, resetLoading && styles.buttonDisabled]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
                activeOpacity={0.85}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#080808" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setForgotMode(false)} style={styles.switchButton}>
                <Text style={styles.switchText}>
                  Back to <Text style={styles.switchHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ─── Sign in mode ─────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>INGRYN</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errorMsg ? styles.inputError : null]}
              placeholder="you@example.com"
              placeholderTextColor="#333"
              value={email}
              onChangeText={t => { setEmail(t); setErrorMsg('') }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, errorMsg ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#333"
                value={password}
                onChangeText={t => { setPassword(t); setErrorMsg('') }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => { setForgotMode(true); setResetEmail(email) }}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {lockoutSeconds > 0 && (
          <View style={styles.lockoutBanner}>
            <Text style={styles.lockoutText}>
              🔒 Too many attempts. Try again in {lockoutSeconds}s
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, (loading || lockoutSeconds > 0) && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading || lockoutSeconds > 0}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#080808" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.switchButton}>
          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text style={styles.switchHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#00E5A010', top: -100, right: -100,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#00E5A008', bottom: 50, left: -80,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, marginBottom: 20,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 24 },
  brand: { fontSize: 16, fontWeight: '800', color: '#00E5A0', letterSpacing: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 40 },
  form: { gap: 20, marginBottom: 24 },
  inputGroup: { gap: 8 },
  label: {
    fontSize: 13, color: '#888', fontWeight: '500',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 16, color: '#fff',
  },
  inputError: { borderColor: '#ff4444' },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111',
    borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 16,
  },
  passwordInput: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#fff' },
  eyeButton: { padding: 8 },
  eyeText: { fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, color: '#00E5A0', fontWeight: '500' },
  errorBanner: {
    backgroundColor: '#1a0505', borderWidth: 1, borderColor: '#3a1010',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16,
  },
  errorText: { color: '#ff6b6b', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  lockoutBanner: {
    backgroundColor: '#1a0a0a', borderWidth: 1, borderColor: '#3a1a1a',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 16, alignItems: 'center',
  },
  lockoutText: { color: '#ff6b6b', fontSize: 13, fontWeight: '500' },
  primaryButton: {
    backgroundColor: '#00E5A0', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#080808', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1a1a1a' },
  dividerText: { fontSize: 13, color: '#444' },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
    borderRadius: 14, paddingVertical: 16, gap: 12, marginBottom: 24,
  },
  googleIcon: { fontSize: 18, fontWeight: '700', color: '#fff' },
  googleText: { fontSize: 15, color: '#ccc', fontWeight: '500' },
  switchButton: { alignItems: 'center', paddingTop: 4 },
  switchText: { fontSize: 14, color: '#555' },
  switchHighlight: { color: '#00E5A0', fontWeight: '600' },
  resetSuccessContainer: { alignItems: 'center', paddingTop: 20 },
  resetSuccessIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#00E5A015',
    borderWidth: 1, borderColor: '#00E5A030', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
  },
  resetSuccessIconText: { fontSize: 28, color: '#00E5A0' },
  resetEmailHighlight: { color: '#00E5A0', fontWeight: '600' },
  resetHint: {
    fontSize: 13, color: '#444', textAlign: 'center',
    marginTop: 16, marginBottom: 32, lineHeight: 20,
  },
})