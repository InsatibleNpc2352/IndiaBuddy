import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import PriceChart from '../../src/components/PriceChart';
import { useState } from 'react';

export default function PredictScreen() {
  const [route, setRoute] = useState('DEL - BOM');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Price Predictor</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={route} 
          onChangeText={setRoute} 
          placeholder="Enter Route (e.g. DEL-BOM)" 
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>365-Day Forecast</Text>
        <PriceChart />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>News Signals</Text>
        <View style={styles.newsItem}>
          <Text style={styles.newsHeadline}>Diwali festival expected to hike prices by 20%</Text>
          <Text style={styles.newsImpactNegative}>Impact: High (Prices ↑)</Text>
        </View>
        <View style={styles.newsItem}>
          <Text style={styles.newsHeadline}>New Vande Bharat train announced on this route</Text>
          <Text style={styles.newsImpactPositive}>Impact: Positive (Prices ↓)</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.alertButton}>
        <Text style={styles.alertButtonText}>Set Price Alert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 20 },
  input: { fontSize: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  newsItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  newsHeadline: { fontSize: 16, marginBottom: 4 },
  newsImpactNegative: { color: '#E53935', fontSize: 14, fontWeight: 'bold' },
  newsImpactPositive: { color: '#43A047', fontSize: 14, fontWeight: 'bold' },
  alertButton: { backgroundColor: '#FF5A5F', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  alertButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
