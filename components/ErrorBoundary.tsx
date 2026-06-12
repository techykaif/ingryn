import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native'

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
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#E24B4A15', borderWidth: 1,
    borderColor: '#E24B4A30', alignItems: 'center',
    justifyContent: 'center', marginBottom: 8,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 24, fontWeight: '700',
    color: '#fff', textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: '#555',
    textAlign: 'center', lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1a1a1a',
    padding: 16, width: '100%',
  },
  errorText: {
    fontSize: 12, color: '#E24B4A',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00E5A0', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 40,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16, fontWeight: '700', color: '#080808',
  },
})