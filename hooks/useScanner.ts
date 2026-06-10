import { useState, useRef, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import { CameraView } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { saveAnalysis } from './useIngredientAnalysis'

export const IS_WEB = Platform.OS === 'web'

export type ScanStep = 'camera' | 'processing' | 'manual'

const PROCESSING_TIPS = [
  'Identifying ingredients...',
  'Checking safety levels...',
  'Scanning country regulations...',
  'Analyzing health concerns...',
  'Almost there...',
]

export function useScanner(userId: string, onSuccess: (scanId: string) => void) {
  const [step, setStep] = useState<ScanStep>('camera')
  const [flash, setFlash] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [processingTip, setProcessingTip] = useState(0)
  const [manualText, setManualText] = useState('')
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
  }, [])

  const deactivateCamera = useCallback(() => {
    setCameraActive(false)
    setCameraReady(false)
    stopTipCycle()
  }, [stopTipCycle])

  const processText = useCallback(async (text: string) => {
    setStep('processing')
    startTipCycle()

    const { scanId, error } = await saveAnalysis(text, userId)

    stopTipCycle()

    if (error || !scanId) {
      setStep(IS_WEB ? 'manual' : 'camera')
      Alert.alert('Analysis failed', error || 'Could not analyze ingredients. Please try again.')
      return
    }

    setManualText('')
    setStep(IS_WEB ? 'manual' : 'camera')
    onSuccess(scanId)
  }, [userId, startTipCycle, stopTipCycle, onSuccess])

  const recognizeFromUri = useCallback(async (uri: string) => {
    if (IS_WEB) {
      stopTipCycle()
      setStep('manual')
      Alert.alert(
        'Web limitation',
        'Camera OCR is not available on web. Please type the ingredients manually.'
      )
      return
    }

    try {
      const TextRecognition = (await import('@react-native-ml-kit/text-recognition')).default
      const result = await TextRecognition.recognize(uri)
      const text = result.text?.trim() || ''

      if (!text || text.length < 10) {
        stopTipCycle()
        setStep('camera')
        Alert.alert(
          'Could not read label',
          'Try better lighting or a flatter surface.',
          [
            { text: 'Try again', style: 'cancel' },
            { text: 'Type manually', onPress: () => setStep('manual') },
          ]
        )
        return
      }

      await processText(text)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      Alert.alert('OCR failed', e.message || 'Could not read the image.')
    }
  }, [stopTipCycle, processText])

  // Uses native camera app via ImagePicker — avoids ERR_IMAGE_CAPTURE_FAILED
  const handleCapture = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to scan ingredients.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      })

      if (result.canceled || !result.assets?.[0]) return

      const uri = result.assets[0].uri
      setStep('processing')
      startTipCycle()
      await recognizeFromUri(uri)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      Alert.alert(
        'Capture failed',
        e.message || 'Could not take photo.',
        [
          { text: 'Try again', style: 'cancel' },
          { text: 'Type manually', onPress: () => setStep('manual') },
        ]
      )
    }
  }, [startTipCycle, stopTipCycle, recognizeFromUri])

  const handleGalleryPick = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: false,
      })

      if (result.canceled || !result.assets?.[0]) return

      const uri = result.assets[0].uri
      setStep('processing')
      startTipCycle()
      await recognizeFromUri(uri)
    } catch (e: any) {
      stopTipCycle()
      setStep('camera')
      Alert.alert('Gallery error', e.message || 'Could not open gallery.')
    }
  }, [startTipCycle, stopTipCycle, recognizeFromUri])

  const handleManualSubmit = useCallback(async () => {
    if (!manualText.trim() || manualText.trim().length < 3) {
      Alert.alert('Error', 'Please enter at least one ingredient')
      return
    }
    await processText(manualText.trim())
  }, [manualText, processText])

  return {
    step, setStep,
    flash, setFlash,
    cameraActive,
    cameraReady, setCameraReady,
    processingTip,
    manualText, setManualText,
    cameraRef,
    processingTips: PROCESSING_TIPS,
    activateCamera,
    deactivateCamera,
    handleCapture,
    handleGalleryPick,
    handleManualSubmit,
  }
}