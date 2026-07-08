import { useState, useEffect, useRef } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import { Lock, Eye, EyeSlash, Warning, CheckCircle } from 'phosphor-react-native'

type ScreenState = 'verifying' | 'ready' | 'submitting' | 'success' | 'invalid'

function parseTokensFromUrl(url: string | null): { access_token: string; refresh_token: string } | null {
    if (!url) return null
    const parsed = Linking.parse(url.replace('#', '?'))
    const queryParams = parsed.queryParams || {}
    const access_token = queryParams.access_token as string | undefined
    const refresh_token = queryParams.refresh_token as string | undefined
    if (!access_token || !refresh_token) return null
    return { access_token, refresh_token }
}

export default function ResetPasswordScreen() {
    const router = useRouter()
    const [state, setState] = useState<ScreenState>('verifying')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        let cancelled = false
        const handledUrls = new Set<string>()

        async function tryEstablishSession(url: string | null) {
            if (!url) return false
            if (handledUrls.has(url)) return true
            handledUrls.add(url)
            const parsed = Linking.parse(url.replace('#', '?'))
            const queryParams = parsed.queryParams || {}
            
            const code = queryParams.code as string | undefined
            if (code) {
                const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
                if (cancelled) return true
                setState(sessionError ? 'invalid' : 'ready')
                return true
            }

            const tokens = parseTokensFromUrl(url)
            if (!tokens) return false

            const { error: sessionError } = await supabase.auth.setSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
            })

            if (cancelled) return true
            setState(sessionError ? 'invalid' : 'ready')
            return true
        }

        // Cold start — app was opened directly via the email link
        async function checkInitialUrl() {
            try {
                const initialUrl = await Linking.getInitialURL()
                const handled = await tryEstablishSession(initialUrl)
                if (!handled && !cancelled) setState('invalid')
            } catch {
                if (!cancelled) setState('invalid')
            }
        }
        checkInitialUrl()

        // Warm start — app was already open in the background when the link was tapped
        const subscription = Linking.addEventListener('url', ({ url }) => {
            tryEstablishSession(url)
        })

        return () => {
            cancelled = true
            subscription.remove()
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    async function handleReset() {
        setError('')
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setState('submitting')
        const { error: updateError } = await supabase.auth.updateUser({ password })

        if (updateError) {
            setError(updateError.message)
            setState('ready')
            return
        }

        setState('success')
        timeoutRef.current = setTimeout(() => router.replace('/(tabs)/home'), 1500)
    }

    if (state === 'verifying') {
        return (
            <View style={styles.centered}>
                <StatusBar style="dark" />
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        )
    }

    if (state === 'invalid') {
        return (
            <View style={styles.centered}>
                <StatusBar style="dark" />
                <Warning size={40} color={Colors.danger} weight="fill" />
                <Text style={styles.invalidTitle}>This link has expired</Text>
                <Text style={styles.invalidBody}>
                    Password reset links only work once and expire after a short time. Request a new one from the sign in screen.
                </Text>
                <TouchableOpacity
                    style={styles.backToSigninBtn}
                    onPress={() => router.replace('/(auth)/signin')}
                >
                    <Text style={styles.backToSigninText}>Back to sign in</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (state === 'success') {
        return (
            <View style={styles.centered}>
                <StatusBar style="dark" />
                <CheckCircle size={40} color={Colors.success} weight="fill" />
                <Text style={styles.invalidTitle}>Password updated</Text>
                <Text style={styles.invalidBody}>Taking you to your dashboard...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar style="dark" />
            <View style={styles.content}>
                <Image source={require('@/assets/icon.png')} style={styles.iconWrap} />
                <Text style={styles.title}>Set a new password</Text>
                <Text style={styles.subtitle}>Choose a strong password you haven't used before.</Text>

                <View style={[styles.inputWrapper, Shadows.sm]}>
                    <Lock size={18} color={Colors.textTertiary} />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={t => { setPassword(t); setError('') }}
                        placeholder="New password"
                        placeholderTextColor={Colors.textTertiary}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword
                            ? <EyeSlash size={18} color={Colors.textTertiary} />
                            : <Eye size={18} color={Colors.textTertiary} />}
                    </TouchableOpacity>
                </View>

                <View style={[styles.inputWrapper, Shadows.sm]}>
                    <Lock size={18} color={Colors.textTertiary} />
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={t => { setConfirmPassword(t); setError('') }}
                        placeholder="Confirm new password"
                        placeholderTextColor={Colors.textTertiary}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                    />
                </View>

                {error ? (
                    <View style={styles.errorBanner}>
                        <Warning size={16} color={Colors.danger} weight="fill" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.submitBtn, Shadows.primary]}
                    onPress={handleReset}
                    disabled={state === 'submitting'}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtnGradient}
                    >
                        {state === 'submitting'
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.submitBtnText}>Update password</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'], gap: Spacing.md },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'], gap: Spacing.lg },
    iconWrap: { width: 56, height: 56, borderRadius: 16, alignSelf: 'center', marginBottom: Spacing.md },
    title: { fontFamily: Fonts.bold, fontSize: FontSizes['2xl'], color: Colors.textPrimary, textAlign: 'center' },
    subtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
    invalidTitle: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: Colors.textPrimary, textAlign: 'center' },
    invalidBody: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    backToSigninBtn: { marginTop: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
    backToSigninText: { fontFamily: Fonts.semibold, fontSize: FontSizes.sm, color: Colors.primary },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border },
    input: { flex: 1, fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textPrimary },
    errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, padding: Spacing.md },
    errorText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger },
    submitBtn: { borderRadius: Radius.xl, overflow: 'hidden', marginTop: Spacing.sm },
    submitBtnGradient: { paddingVertical: Spacing.xl, alignItems: 'center' },
    submitBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
})