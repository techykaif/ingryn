import { useState, useRef, useCallback } from 'react'
import { Platform } from 'react-native'
import { CameraView } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { saveAnalysis } from './useIngredientAnalysis'
import { useDietaryPreferences } from './useDietaryPreferences'

export const IS_WEB = Platform.OS === 'web'

export type ScanStep = 'camera' | 'processing' | 'manual'
export type ScanError = { message: string; allowManual?: boolean } | null

const PROCESSING_TIPS = [
  'Identifying ingredients...',
  'Checking safety levels...',
  'Scanning country regulations...',
  'Analyzing health concerns...',
  'Almost there...',
]

export function useScanner(userId: string, onSuccess: (scanId: string) => void) {
  const { preferences } = useDietaryPreferences()
  const [step, setStep] = useState<ScanStep>('camera')
  const [flash, setFlash] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [processingTip, setProcessingTip] = useState(0)
  const [manualText, setManualText] = useState('')
  const [scanError, setScanError] = useState<ScanError>(null)
  const cameraRef = useRef<CameraView>(null)
  const tipInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTipCycle = useCallback(() => {
    let i = 0
    tipInterval.current = setInterval(() => {
      i = (i + 1) % PROCESSING_TIPS.length
      setProcessingTip(i)
    }, 1800)
  }, [])

  const stopTipCycle = useCallback(() => {
    if (tipInterval.current) {
      clearInterval(tipInterval.current)
      tipInterval.current = null
    }
  }, [])

  const activateCamera = useCallback(() => {
    setCameraActive(true)
    setScanError(null)
  }, [])

  const deactivateCamera = useCallback(() => {
    setCameraActive(false)
    setCameraReady(false)
    stopTipCycle()
  }, [stopTipCycle])

  const processText = useCallback(async (text: string) => {
    setScanError(null)
    setStep('processing')
    startTipCycle()
    const { scanId, error } = await saveAnalysis(text, userId, preferences)
    stopTipCycle()

    if (error || !scanId) {
      setStep(IS_WEB ? 'manual' : 'camera')
      setScanError({ message: error || 'Could not analyse ingredients. Please try again.', allowManual: true })
      return
    }

    setManualText('')
    setScanError(null)
    setStep(IS_WEB ? 'manual' : 'camera')
    onSuccess(scanId)
  }, [userId, preferences, startTipCycle, stopTipCycle, onSuccess])

  const recognizeFromUri = useCallback(async (uri: string) => {
    if (IS_WEB) {
      stopTipCycle()
      setStep('manual')
      setScanError({ message: 'Camera OCR is not available on web. Please type the ingredients manually.' })
      return
    }

    try {
      const TextRecognition = (await import('@react-native-ml-kit/text-recognition')).default
      const result = await TextRecognition.recognize(uri)
      const text = result.text?.trim() || ''

      if (!text || text.length < 10) {
        stopTipCycle()
        setStep('camera')
        setScanError({
          message: 'Could not read the label. Try better lighting or a flatter surface.',
          allowManual: true,
        })
        return
      }

      await processText(text)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      setScanError({ message: e.message || 'Could not read the image.', allowManual: true })
    }
  }, [stopTipCycle, processText])

  // ─── KEY FIX: use takePictureAsync (in-app) instead of launchCameraAsync
  // launchCameraAsync launches the native camera app externally — on Android
  // when returning from an external app, the React Native Activity gets
  // destroyed and the app appears to "restart". takePictureAsync keeps
  // everything inside the app and avoids this entirely.
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady) return
    setScanError(null)

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,        // reduce size to avoid OOM on low-end devices
        base64: false,
        skipProcessing: true, // faster capture, no post-processing
      })

      if (!photo?.uri) return

      setStep('processing')
      startTipCycle()
      await recognizeFromUri(photo.uri)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      setScanError({
        message: e.message || 'Could not take photo. Try again.',
        allowManual: true,
      })
    }
  }, [cameraReady, startTipCycle, stopTipCycle, recognizeFromUri])

  const handleGalleryPick = useCallback(async () => {
    setScanError(null)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      })

      if (result.canceled || !result.assets?.[0]) return

      setStep('processing')
      startTipCycle()
      await recognizeFromUri(result.assets[0].uri)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      setScanError({ message: e.message || 'Could not open gallery.', allowManual: true })
    }
  }, [startTipCycle, stopTipCycle, recognizeFromUri])

  const handleManualSubmit = useCallback(async () => {
    if (!manualText.trim() || manualText.trim().length < 3) {
      setScanError({ message: 'Please enter at least one ingredient.' })
      return
    }
    await processText(manualText.trim())
  }, [manualText, processText])

  const clearError = useCallback(() => setScanError(null), [])

  return {
    step, setStep,
    flash, setFlash,
    cameraActive,
    cameraReady, setCameraReady,
    processingTip,
    manualText, setManualText,
    scanError, clearError,
    cameraRef,
    processingTips: PROCESSING_TIPS,
    activateCamera,
    deactivateCamera,
    handleCapture,
    handleGalleryPick,
    handleManualSubmit,
  }
}