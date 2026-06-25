import { View, ActivityIndicator } from 'react-native'

// This file intentionally does nothing.
// All routing is handled by app/_layout.tsx (AuthGate).
// Having routing logic here AND in _layout.tsx causes conflicts.
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: '#080808', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#00E5A0" size="large" />
    </View>
  )
}