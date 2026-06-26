import { View, ActivityIndicator } from 'react-native'

// This file intentionally does nothing.
// All routing is handled by app/_layout.tsx (AuthGate).
// Having routing logic here AND in _layout.tsx causes conflicts.
import { Colors } from '@/constants/theme'
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#00E5A0" size="large" />
    </View>
  )
}