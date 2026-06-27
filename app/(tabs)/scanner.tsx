import { useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/store'
import { useScanner, IS_WEB } from '@/hooks/useScanner'
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '@/constants/theme'
import {
  Image as ImageIcon, TextT, Lightning, LightningSlash,
  Scan, ArrowLeft, Camera, Warning, X
} from 'phosphor-react-native'

const { width, height } = Dimensions.get('window')
const FRAME_W = width * 0.86
const FRAME_H = height * 0.26

export default function ScannerScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [permission, requestPermission] = useCameraPermissions()

  const {
    step, setStep,
    flash, setFlash,
    cameraActive,
    cameraReady, setCameraReady,
    processingTip,
    manualText, setManualText,
    scanError, clearError,
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
      const timer = setTimeout(() => activateCamera(), 300)
      return () => { clearTimeout(timer); deactivateCamera() }
    }, [activateCamera, deactivateCamera])
  )

  if (step === 'processing') {
    return <ProcessingScreen tip={processingTips[processingTip]} tipIndex={processingTip} total={processingTips.length} />
  }

  if (step === 'manual') {
    return (
      <ManualScreen
        value={manualText}
        onChange={setManualText}
        onSubmit={handleManualSubmit}
        onBack={() => { setStep('camera'); clearError() }}
        error={scanError?.message}
        clearError={clearError}
      />
    )
  }

  if (!permission?.granted) {
    return (
      <PermissionScreen
        onGrant={requestPermission}
        onManual={() => setStep('manual')}
      />
    )
  }

  return (
    <CameraScreen
      cameraRef={cameraRef}
      cameraActive={cameraActive}
      cameraReady={cameraReady}
      onCameraReady={() => setCameraReady(true)}
      flash={flash}
      onFlashToggle={() => setFlash(!flash)}
      onCapture={handleCapture}
      onGallery={handleGalleryPick}
      onManual={() => { setStep('manual'); clearError() }}
      error={scanError?.message}
      allowManual={scanError?.allowManual}
      clearError={clearError}
    />
  )
}

// ─── Processing ───────────────────────────────────────────────────────────────
function ProcessingScreen({ tip, tipIndex, total }: { tip: string; tipIndex: number; total: number }) {
  return (
    <View style={styles.processingContainer}>
      <StatusBar style="dark" />
      <View style={styles.processingRing}>
        <View style={styles.processingRingInner}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </View>
      <Text style={styles.processingTitle}>Analysing</Text>
      <Text style={styles.processingSubtitle}>AI is reading your ingredients</Text>
      <Text style={styles.processingTip}>{tip}</Text>
      <View style={styles.processingDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === tipIndex ? Colors.primary : Colors.border, width: i === tipIndex ? 20 : 6 }]} />
        ))}
      </View>
    </View>
  )
}

// ─── Permission ───────────────────────────────────────────────────────────────
function PermissionScreen({ onGrant, onManual }: { onGrant: () => void; onManual: () => void }) {
  return (
    <View style={styles.permissionContainer}>
      <StatusBar style="dark" />
      <View style={styles.permissionBlob} />
      <View style={[styles.permissionIconBox, Shadows.md]}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.permissionIconGradient}>
          <Camera size={40} color="#fff" weight="fill" />
        </LinearGradient>
      </View>
      <Text style={styles.permissionTitle}>Camera access needed</Text>
      <Text style={styles.permissionSubtitle}>
        INGRYN needs camera access to{'\n'}scan ingredient labels.
      </Text>
      <TouchableOpacity style={[styles.permissionBtn, Shadows.primary]} onPress={onGrant} activeOpacity={0.9}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.permissionBtnGradient}>
          <Text style={styles.permissionBtnText}>Grant camera access</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.permissionSecondary} onPress={onManual}>
        <TextT size={16} color={Colors.primary} weight="bold" />
        <Text style={styles.permissionSecondaryText}>Type ingredients manually</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Manual entry ─────────────────────────────────────────────────────────────
function ManualScreen({
  value, onChange, onSubmit, onBack, error, clearError
}: {
  value: string; onChange: (t: string) => void; onSubmit: () => void
  onBack: () => void; error?: string; clearError: () => void
}) {
  return (
    <KeyboardAvoidingView style={styles.manualContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <View style={styles.manualHeader}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, Shadows.sm]}>
          <ArrowLeft size={22} color={Colors.textPrimary} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.manualTitle}>Type ingredients</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.manualScroll} contentContainerStyle={styles.manualContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.manualSubtitle}>Paste or type the full ingredients list from the label</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Warning size={14} color={Colors.danger} weight="fill" />
            <Text style={styles.errorBannerText}>{error}</Text>
            <TouchableOpacity onPress={clearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color={Colors.danger} weight="bold" />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={styles.manualInput}
          value={value}
          onChangeText={t => { onChange(t); clearError() }}
          placeholder="Water, Sugar, Salt, Sodium Benzoate, Yellow 5..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={8}
          autoFocus
          textAlignVertical="top"
        />
        <Text style={styles.manualHint}>Comma-separated works best</Text>

        <TouchableOpacity
          style={[styles.analyzeBtn, !value.trim() && styles.analyzeBtnDisabled, Shadows.primary]}
          onPress={onSubmit}
          disabled={!value.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={value.trim() ? [Colors.primary, Colors.primaryDark] : [Colors.border, Colors.border]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.analyzeBtnGradient}
          >
            <Scan size={18} color={value.trim() ? '#fff' : Colors.textTertiary} weight="bold" />
            <Text style={[styles.analyzeBtnText, !value.trim() && styles.analyzeBtnTextDisabled]}>
              Analyse ingredients
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Camera (stays dark) ──────────────────────────────────────────────────────
function CameraScreen({
  cameraRef, cameraActive, cameraReady, onCameraReady,
  flash, onFlashToggle, onCapture, onGallery, onManual,
  error, allowManual, clearError
}: {
  cameraRef: React.RefObject<CameraView | null>
  cameraActive: boolean; cameraReady: boolean; onCameraReady: () => void
  flash: boolean; onFlashToggle: () => void
  onCapture: () => void; onGallery: () => void; onManual: () => void
  error?: string; allowManual?: boolean; clearError: () => void
}) {
  return (
    <View style={styles.cameraContainer}>
      <StatusBar style="light" hidden />

      {cameraActive && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flash ? 'on' : 'off'}
          onCameraReady={onCameraReady}
        />
      )}

      {/* Top bar */}
      <View style={styles.topFade}>
        <View style={styles.topBar}>
          <Text style={styles.topBarBrand}>INGRYN</Text>
          <TouchableOpacity style={[styles.flashBtn, flash && styles.flashBtnActive]} onPress={onFlashToggle}>
            {flash
              ? <LightningSlash size={18} color="#000" weight="fill" />
              : <Lightning size={18} color="#fff" weight="bold" />
            }
          </TouchableOpacity>
        </View>
        <Text style={styles.topInstruction}>
          {cameraReady ? 'Point at ingredient list' : 'Initialising camera...'}
        </Text>
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

      {/* Error banner over camera */}
      {error ? (
        <View style={styles.cameraErrorBanner}>
          <Warning size={14} color="#fff" weight="fill" />
          <Text style={styles.cameraErrorText} numberOfLines={2}>{error}</Text>
          <View style={styles.cameraErrorActions}>
            {allowManual && (
              <TouchableOpacity style={styles.cameraErrorBtn} onPress={onManual}>
                <Text style={styles.cameraErrorBtnText}>Type</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={clearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Bottom controls */}
      <View style={styles.bottomFade}>
        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.sideBtn} onPress={onGallery} activeOpacity={0.8}>
            <View style={styles.sideBtnInner}>
              <ImageIcon size={22} color="#fff" weight="regular" />
            </View>
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, !cameraReady && { opacity: 0.4 }]}
            onPress={onCapture}
            disabled={!cameraReady}
            activeOpacity={0.85}
          >
            <View style={styles.captureOuter}>
              <View style={styles.captureInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideBtn} onPress={onManual} activeOpacity={0.8}>
            <View style={styles.sideBtnInner}>
              <TextT size={22} color="#fff" weight="regular" />
            </View>
            <Text style={styles.sideBtnLabel}>Manual</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomHint}>
          {cameraReady ? 'Tap the button to capture' : 'Please wait...'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  processingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingHorizontal: Spacing['3xl'] },
  processingRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: `${Colors.primary}30`, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  processingRingInner: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  processingTitle: { fontFamily: Fonts.extrabold, fontSize: FontSizes['4xl'], color: Colors.textPrimary },
  processingSubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, marginTop: -Spacing.sm },
  processingTip: { fontFamily: Fonts.medium, fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginTop: Spacing.md },
  processingDots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md },
  dot: { height: 6, borderRadius: 3 },

  permissionContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['3xl'], gap: Spacing.lg },
  permissionBlob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: `${Colors.primary}10`, top: -100, right: -80 },
  permissionIconBox: { borderRadius: 32, overflow: 'hidden', marginBottom: Spacing.md },
  permissionIconGradient: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  permissionTitle: { fontFamily: Fonts.extrabold, fontSize: FontSizes['3xl'], color: Colors.textPrimary, textAlign: 'center' },
  permissionSubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  permissionBtn: { width: '100%', borderRadius: Radius.xl, overflow: 'hidden', marginTop: Spacing.md },
  permissionBtnGradient: { paddingVertical: Spacing.xl, alignItems: 'center' },
  permissionBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
  permissionSecondary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.md },
  permissionSecondaryText: { fontFamily: Fonts.semibold, fontSize: FontSizes.base, color: Colors.primary },

  manualContainer: { flex: 1, backgroundColor: Colors.background },
  manualHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingHorizontal: Spacing['2xl'], marginBottom: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  manualTitle: { fontFamily: Fonts.bold, fontSize: FontSizes.xl, color: Colors.textPrimary },
  manualScroll: { flex: 1 },
  manualContent: { paddingHorizontal: Spacing['2xl'], paddingBottom: 48, paddingTop: Spacing.md },
  manualSubtitle: { fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  errorBannerText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: Colors.danger, lineHeight: 18 },
  manualInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl, fontFamily: Fonts.regular, fontSize: FontSizes.base, color: Colors.textPrimary, minHeight: 180, marginBottom: Spacing.sm, lineHeight: 24, ...Shadows.sm },
  manualHint: { fontFamily: Fonts.regular, fontSize: FontSizes.xs, color: Colors.textTertiary, marginBottom: Spacing['2xl'] },
  analyzeBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  analyzeBtnText: { fontFamily: Fonts.bold, fontSize: FontSizes.lg, color: '#fff' },
  analyzeBtnTextDisabled: { color: Colors.textTertiary },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.55)', gap: 6 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarBrand: { fontFamily: Fonts.extrabold, fontSize: FontSizes.base, color: Colors.primary, letterSpacing: 4 },
  flashBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  flashBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  topInstruction: { fontFamily: Fonts.regular, fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 },
  frameWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME_W, height: FRAME_H, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: Colors.primary },
  tl: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 5 },
  tr: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 5 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 5 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 5 },
  scanLine: { width: FRAME_W - 40, height: 1.5, backgroundColor: `${Colors.primary}40` },
  cameraErrorBanner: { position: 'absolute', left: 16, right: 16, bottom: 160, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: Radius.xl, padding: Spacing.lg },
  cameraErrorText: { flex: 1, fontFamily: Fonts.medium, fontSize: FontSizes.sm, color: '#fff', lineHeight: 18 },
  cameraErrorActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cameraErrorBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  cameraErrorBtnText: { fontFamily: Fonts.semibold, fontSize: FontSizes.xs, color: '#fff' },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 52, paddingTop: 28, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', gap: 16 },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  sideBtn: { alignItems: 'center', gap: 8 },
  sideBtnInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  sideBtnLabel: { fontFamily: Fonts.medium, fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3 },
  captureBtn: { alignItems: 'center', justifyContent: 'center' },
  captureOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 3, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: `${Colors.primary}12` },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.primary },
  bottomHint: { fontFamily: Fonts.regular, fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.3 },
})