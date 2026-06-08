import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '@/lib/supabase'

export default function SignUpScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

 async function handleSignUp() {
  if (!fullName || !email || !password) {
    Alert.alert('Error', 'Please fill in all fields')
    return
  }
  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters')
    return
  }
  setLoading(true)

  console.log('=== SIGNUP DEBUG ===')
  console.log('Email:', email)
  console.log('Password length:', password.length)
  console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
  console.log('Anon key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })

    console.log('=== SIGNUP RESULT ===')
    console.log('Error:', JSON.stringify(error))
    console.log('User:', JSON.stringify(data?.user))
    console.log('Session:', JSON.stringify(data?.session))

    if (error) {
      Alert.alert('Sign up failed', `${error.message}\n\nStatus: ${error.status}`)
    } else if (data?.user) {
      Alert.alert('Success', `User created: ${data.user.email}`)
      router.replace('/(tabs)/home')
    } else {
      Alert.alert('Unknown state', JSON.stringify(data))
    }
  } catch (e: any) {
    console.log('=== CAUGHT EXCEPTION ===')
    console.log(e)
    Alert.alert('Exception', e.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Header */}
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start scanning in seconds</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#333"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#333"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor="#333"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <PasswordStrength password={password} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#080808" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
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

        <TouchableOpacity
          onPress={() => router.push('/(auth)/signin')}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const colors = ['#222', '#E24B4A', '#EF9F27', '#00E5A0']
  const labels = ['', 'Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <View style={{ marginTop: 8, gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= strength ? colors[strength] : '#222',
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors[strength] }}>{labels[strength]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00E5A010',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00E5A008',
    bottom: 50,
    left: -80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 24,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00E5A0',
    letterSpacing: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  eyeButton: {
    padding: 8,
  },
  eyeText: {
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#00E5A0',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#080808',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1a1a1a',
  },
  dividerText: {
    fontSize: 13,
    color: '#444',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 24,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  googleText: {
    fontSize: 15,
    color: '#ccc',
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#555',
  },
  switchHighlight: {
    color: '#00E5A0',
    fontWeight: '600',
  },
})