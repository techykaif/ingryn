import { Colors } from '@/constants/theme'

export const getScoreColor = (score: number | null) => {
  if (score === null) return Colors.unknown
  if (score >= 75) return Colors.safe
  if (score >= 45) return Colors.caution
  return Colors.harmful
}

export const getScoreLabel = (score: number | null) => {
  if (score === null) return 'N/A'
  if (score >= 75) return 'Safe'
  if (score >= 45) return 'Caution'
  return 'Harmful'
}

export const formatDate = (dateStr: string, includeYear = false) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (!includeYear) {
    if (diff < 0) return 'Just now'
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getSafetyColor = (level: string) => {
  const colors: Record<string, string> = {
    safe: Colors.safe,
    caution: Colors.caution,
    harmful: Colors.harmful,
    unknown: Colors.unknown
  }
  return colors[level] || Colors.unknown
}

export const getSafetyLabel = (level: string) => {
  const labels: Record<string, string> = {
    safe: 'Safe',
    caution: 'Caution',
    harmful: 'Harmful',
    unknown: 'Unknown'
  }
  return labels[level] || 'Unknown'
}
