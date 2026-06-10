import { useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/store'
import { useScanner, IS_WEB } from '@/hooks/useScanner'
import { Image, Type, Zap } from 'lucide-react-native'

const { width, height } = Dimensions.get('window')

export default function ScannerScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [permission, requestPermission] = useCameraPermissions()

  const {
    step, setStep,
    flash, setFlash,
    cameraActive,
    processingTip,
    manualText, setManualText,
    cameraRef,
    processingTips,
    activateCamera,
    deactivateCamera,
    handleCapture,
    handleGalleryPick,
    handleManualSubmit,
  } = useScanner(user?.id || '', (scanId) => router.push(`/results/${scanId}`))

  useFocusEffect(
    useCallback(() => {
      activateCamera()
      return () => deactivateCamera()
    }, [activateCamera, deactivateCamera])
  )

  // ── Processing ──
  if (step === 'processing') {
    return <ProcessingScreen tip={processingTips[processingTip]} tipIndex={processingTip} total={processingTips.length} />
  }

  // ── Manual ──
  if (step === 'manual') {
    return (
      <ManualScreen
        value={manualText}
        onChange={setManualText}
        onSubmit={handleManualSubmit}
        onBack={() => setStep('camera')}
      />
    )
  }

  // ── Permission ──
  if (!permission?.granted) {
    return (
      <PermissionScreen
        onGrant={requestPermission}
        onManual={() => setStep('manual')}
      />
    )
  }

  // ── Camera ──
  return (
    <CameraScreen
      cameraRef={cameraRef}
      cameraActive={cameraActive}
      flash={flash}
      onFlashToggle={() => setFlash(!flash)}
      onCapture={handleCapture}
      onGallery={handleGalleryPick}
      onManual={() => setStep('manual')}
    />
  )
}

// ─────────────────────────────────────────────
// Sub-screens
// ─────────────────────────────────────────────

function ProcessingScreen({ tip, tipIndex, total }: { tip: string; tipIndex: number; total: number }) {
  return (
    <View style={styles.processingContainer}>
      <StatusBar style="light" />
      <View style={styles.processingRing}>
        <ActivityIndicator color="#00E5A0" size="large" />
      </View>
      <Text style={styles.processingTitle}>Analyzing</Text>
      <Text style={styles.processingTip}>{tip}</Text>
      <View style={styles.processingDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === tipIndex ? '#00E5A0' : '#1a1a1a' }]} />
        ))}
      </View>
    </View>
  )
}

function ManualScreen({
  value, onChange, onSubmit, onBack
}: {
  value: string
  onChange: (t: string) => void
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <KeyboardAvoidingView style={styles.manualContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <View style={styles.manualHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.manualTitle}>Type ingredients</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.manualScroll}
        contentContainerStyle={styles.manualContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.manualSubtitle}>
          Paste or type the full ingredients list from the label
        </Text>
        <TextInput
          style={styles.manualInput}
          value={value}
          onChangeText={onChange}
          placeholder="Water, Sugar, Salt, Sodium Benzoate, Yellow 5..."
          placeholderTextColor="#2a2a2a"
          multiline
          numberOfLines={8}
          autoFocus
          textAlignVertical="top"
        />
        <Text style={styles.manualHint}>Comma-separated works best</Text>
        <TouchableOpacity
          style={[styles.analyzeBtn, !value.trim() && styles.analyzeBtnDisabled]}
          onPress={onSubmit}
          disabled={!value.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.analyzeBtnText}>Analyze ingredients</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function PermissionScreen({
  onGrant, onManual
}: {
  onGrant: () => void
  onManual: () => void
}) {
  return (
    <View style={styles.permissionContainer}>
      <StatusBar style="light" />
      <View style={styles.permissionIconBox}>
        <Text style={styles.permissionIconText}>📷</Text>
      </View>
      <Text style={styles.permissionTitle}>Camera access needed</Text>
      <Text style={styles.permissionSubtitle}>
        INGRYN needs camera access to scan ingredient labels.
      </Text>
      <TouchableOpacity style={styles.permissionBtn} onPress={onGrant}>
        <Text style={styles.permissionBtnText}>Grant access</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.permissionSecondary} onPress={onManual}>
        <Text style={styles.permissionSecondaryText}>Type ingredients manually</Text>
      </TouchableOpacity>
    </View>
  )
}

function CameraScreen({
  cameraRef, cameraActive, flash,
  onFlashToggle, onCapture, onGallery, onManual
}: {
  cameraRef: React.RefObject<CameraView | null>
  cameraActive: boolean
  flash: boolean
  onFlashToggle: () => void
  onCapture: () => void
  onGallery: () => void
  onManual: () => void
}) {
  return (
    <View style={styles.cameraContainer}>
      <StatusBar style="light" hidden />

      {cameraActive && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          flash={flash ? 'on' : 'off'}
        />
      )}

      {/* Top overlay */}
      <View style={styles.topFade}>
        <View style={styles.topBar}>
          <Text style={styles.topBarBrand}>INGRYN</Text>
          <TouchableOpacity
            style={[styles.flashBtn, flash && styles.flashBtnActive]}
            onPress={onFlashToggle}
          >
            <Zap stroke={flash ? '#080808' : '#fff'} width={18} height={18} />
          </TouchableOpacity>
        </View>
        <Text style={styles.topInstruction}>Point at ingredient list</Text>
      </View>

      {/* Scan frame */}
      <View style={styles.frameWrapper}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.scanLine} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomFade}>
        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onGallery} activeOpacity={0.8}>
            <View style={styles.secondaryBtnInner}>
              <Image stroke="#fff" width={20} height={20} />
            </View>
            <Text style={styles.secondaryBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={onCapture} activeOpacity={0.85}>
            <View style={styles.captureOuter}>
              <View style={styles.captureInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onManual} activeOpacity={0.8}>
            <View style={styles.secondaryBtnInner}>
              <Type stroke="#fff" width={20} height={20} />
            </View>
            <Text style={styles.secondaryBtnLabel}>Manual</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomHint}>Tap to capture</Text>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const FRAME_W = width * 0.86
const FRAME_H = height * 0.26

const styles = StyleSheet.create({
  processingContainer: {
    flex: 1, backgroundColor: '#080808',
    alignItems: 'center', justifyContent: 'center',
    gap: 14, paddingHorizontal: 40,
  },
  processingRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#00E5A008', borderWidth: 1,
    borderColor: '#00E5A020', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  processingTitle: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  processingTip: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },
  processingDots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  permissionContainer: {
    flex: 1, backgroundColor: '#080808',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  permissionIconBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  permissionIconText: { fontSize: 36 },
  permissionTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 12 },
  permissionSubtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  permissionBtn: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16,
  },
  permissionBtnText: { fontSize: 16, fontWeight: '700', color: '#080808' },
  permissionSecondary: { paddingVertical: 12 },
  permissionSecondaryText: { fontSize: 14, color: '#555' },

  manualContainer: { flex: 1, backgroundColor: '#080808' },
  manualHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, marginBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff' },
  manualTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  manualScroll: { flex: 1 },
  manualContent: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16 },
  manualSubtitle: { fontSize: 15, color: '#444', lineHeight: 24, marginBottom: 20 },
  manualInput: {
    backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#1a1a1a',
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18,
    fontSize: 15, color: '#fff', minHeight: 190, marginBottom: 10, lineHeight: 24,
  },
  manualHint: { fontSize: 12, color: '#2a2a2a', marginBottom: 28 },
  analyzeBtn: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
  },
  analyzeBtnDisabled: { opacity: 0.35 },
  analyzeBtnText: { fontSize: 16, fontWeight: '700', color: '#080808', letterSpacing: 0.3 },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: StyleSheet.absoluteFill,
  topFade: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.55)', gap: 6,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarBrand: { fontSize: 15, fontWeight: '800', color: '#00E5A0', letterSpacing: 4 },
  flashBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  flashBtnActive: { backgroundColor: '#00E5A0', borderColor: '#00E5A0' },
  topInstruction: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '400', letterSpacing: 0.3 },
  frameWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME_W, height: FRAME_H, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#00E5A0' },
  tl: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 5 },
  tr: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 5 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 5 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 5 },
  scanLine: { width: FRAME_W - 40, height: 1.5, backgroundColor: '#00E5A040' },
  bottomFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: 52, paddingTop: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', gap: 16,
  },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  secondaryBtn: { alignItems: 'center', gap: 8 },
  secondaryBtnInner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500', letterSpacing: 0.3 },
  captureBtn: { alignItems: 'center', justifyContent: 'center' },
  captureOuter: {
    width: 82, height: 82, borderRadius: 41,
    borderWidth: 3, borderColor: '#00E5A0',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,229,160,0.08)',
  },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#00E5A0' },
  bottomHint: { fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.3 },
})