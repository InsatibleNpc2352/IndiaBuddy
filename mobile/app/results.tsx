import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import TransportCard from '../src/components/TransportCard';
import PriceChart from '../src/components/PriceChart';
import CautionBanner from '../src/components/CautionBanner';
import PromoBottomSheet from '../src/components/PromoBottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { TransportOption } from '../src/types';

export default function ResultsScreen() {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState('Cheapest');
  const [refreshing, setRefreshing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  const isSpeculative = true; // example condition

  const dummyData: TransportOption[] = [
    { id: '1', mode: 'Flight', operator: 'IndiGo', price: 4500, durationMinutes: 130, departureTime: '08:00', arrivalTime: '10:10', class: 'Economy', tierScore: 85, offersCount: 2, bookingUrl: '' },
    { id: '2', mode: 'Train', operator: 'Rajdhani', price: 2800, durationMinutes: 900, departureTime: '16:00', arrivalTime: '07:00', class: '3A', tierScore: 92, offersCount: 0, bookingUrl: '' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DEL → BOM</Text>
        <TouchableOpacity onPress={() => setShowPromo(true)}>
          <Ionicons name="pricetag" size={24} color="#FF5A5F" />
        </TouchableOpacity>
      </View>

      {isSpeculative && <CautionBanner message="Prices are speculative as the date is beyond 365 days." />}

      <View style={styles.tierContainer}>
        {['Cheapest', 'Fastest', 'Best Value', 'Eco', 'Premium'].map(tier => (
          <TouchableOpacity 
            key={tier} 
            style={[styles.tierChip, activeTier === tier && styles.tierChipActive]}
            onPress={() => setActiveTier(tier)}
          >
            <Text style={[styles.tierText, activeTier === tier && styles.tierTextActive]}>{tier}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransportCard option={item} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Price Trend</Text>
            <PriceChart />
          </View>
        )}
      />

      <PromoBottomSheet visible={showPromo} onClose={() => setShowPromo(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', paddingTop: 40 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tierContainer: { flexDirection: 'row', backgroundColor: 'white', paddingBottom: 10, paddingHorizontal: 16, gap: 8 },
  tierChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee' },
  tierChipActive: { backgroundColor: '#FF5A5F' },
  tierText: { color: '#333' },
  tierTextActive: { color: 'white', fontWeight: 'bold' },
  listContent: { padding: 16 },
  chartContainer: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});
