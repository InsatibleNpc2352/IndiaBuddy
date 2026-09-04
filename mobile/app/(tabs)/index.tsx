import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Good Morning, Traveller 🇮🇳</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Search</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/search')}>
          <Text style={styles.buttonText}>Find Tickets</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <View style={styles.recentItem}><Text>DEL → BOM (Tomorrow)</Text></View>
        <View style={styles.recentItem}><Text>BLR → MAA (Next Week)</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Market Report</Text>
        <View style={styles.reportCard}>
          <Text>Flight prices to Goa are up 15% due to upcoming holidays.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Promo Codes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
          <View style={styles.promoChip}><Text style={styles.promoText}>FLY20 (20% Off)</Text></View>
          <View style={styles.promoChip}><Text style={styles.promoText}>FESTIVE50 (₹500 Off)</Text></View>
          <View style={styles.promoChip}><Text style={styles.promoText}>TRAIN10 (10% Off)</Text></View>
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Routes</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}><Text>DEL ↔ BOM</Text></View>
          <View style={styles.gridItem}><Text>BLR ↔ HYD</Text></View>
          <View style={styles.gridItem}><Text>BOM ↔ GOI</Text></View>
          <View style={styles.gridItem}><Text>MAA ↔ CJB</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  button: { backgroundColor: '#FF5A5F', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  recentItem: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8 },
  reportCard: { backgroundColor: '#E3F2FD', padding: 16, borderRadius: 8 },
  promoScroll: { flexDirection: 'row' },
  promoChip: { backgroundColor: '#FFD54F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12 },
  promoText: { fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { backgroundColor: 'white', width: '48%', padding: 16, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
});
