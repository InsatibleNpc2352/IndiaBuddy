import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransportOption } from '../types';

export default function TransportCard({ option }: { option: TransportOption }) {
  const handlePress = () => {
    if (option.bookingUrl) {
      Linking.openURL(option.bookingUrl);
    }
  };

  const getIcon = () => {
    switch (option.mode) {
      case 'Flight': return 'airplane';
      case 'Train': return 'train';
      case 'Bus': return 'bus';
      default: return 'car';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.operatorInfo}>
          <Ionicons name={getIcon()} size={24} color="#555" />
          <Text style={styles.operator}>{option.operator}</Text>
        </View>
        <Text style={styles.price}>₹{option.price}</Text>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{option.departureTime}</Text>
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{Math.floor(option.durationMinutes / 60)}h {option.durationMinutes % 60}m</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{option.arrivalTime}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.badges}>
          <Text style={styles.classBadge}>{option.class}</Text>
          {option.offersCount > 0 && (
            <Text style={styles.offerBadge}>{option.offersCount} Offers</Text>
          )}
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreText}>Tier Score: {option.tierScore}/100</Text>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, { width: `${option.tierScore}%` }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  operatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  operator: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#FF5A5F' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timeBlock: { alignItems: 'center' },
  time: { fontSize: 18, fontWeight: '600' },
  durationBlock: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
  duration: { color: '#666', fontSize: 12, marginBottom: 4 },
  line: { height: 1, backgroundColor: '#ccc', width: '100%' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  badges: { flexDirection: 'row', gap: 8 },
  classBadge: { backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12 },
  offerBadge: { backgroundColor: '#E8F5E9', color: '#2E7D32', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  scoreBlock: { width: 100 },
  scoreText: { fontSize: 10, color: '#666', marginBottom: 4, textAlign: 'right' },
  scoreBarBg: { height: 4, backgroundColor: '#eee', borderRadius: 2 },
  scoreBarFill: { height: 4, backgroundColor: '#4CAF50', borderRadius: 2 },
});
