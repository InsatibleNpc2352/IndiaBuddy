import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CautionBanner({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={20} color="white" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: { color: 'white', fontWeight: 'bold', fontSize: 14, flex: 1 },
});
