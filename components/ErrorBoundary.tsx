import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native'
import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/constants/theme'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} numberOfLines={4}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.handleReset()}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.lg,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.dangerLight, borderWidth: 1,
    borderColor: Colors.danger, alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.sm,
  },
  icon: { fontSize: 36 },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['3xl'],
    color: Colors.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  errorBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, width: '100%',
  },
  errorText: {
    fontSize: FontSizes.xs, color: Colors.danger,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing['3xl'],
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg, color: Colors.textInverse,
  },
})