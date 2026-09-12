import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import CalendarStrip from '../../src/components/CalendarStrip';
import { useSearchStore } from '../../src/store/searchStore';
import { Mode } from '../../src/types';

export default function SearchScreen() {
  const router = useRouter();
  const origin = useSearchStore(state => state.origin);
  const destination = useSearchStore(state => state.destination);
  const date = useSearchStore(state => state.date);
  const mode = useSearchStore(state => state.mode);
  const setSearchData = useSearchStore(state => state.setSearchData);

  const handleSearch = () => {
    if (origin && destination) {
      router.push('/results');
    }
  };

  const modes: Mode[] = ['All', 'Flight', 'Train', 'Bus'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Origin City (e.g. DEL)"
          value={origin}
          onChangeText={(text) => setSearchData({ origin: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Destination City (e.g. BOM)"
          value={destination}
          onChangeText={(text) => setSearchData({ destination: text })}
        />
      </View>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <CalendarStrip
        selectedDate={date}
        onSelectDate={(newDate) => setSearchData({ date: newDate })}
      />

      <Text style={styles.sectionTitle}>Mode of Transport</Text>
      <View style={styles.modesContainer}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeChip, mode === m && styles.modeChipActive]}
            onPress={() => setSearchData({ mode: m })}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search Tickets</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <Text style={styles.emptyText}>No recent searches yet.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12, fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 10 },
  modesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  modeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  modeChipActive: { backgroundColor: '#FF5A5F' },
  modeText: { color: '#333' },
  modeTextActive: { color: 'white', fontWeight: 'bold' },
  searchButton: { backgroundColor: '#FF5A5F', padding: 16, borderRadius: 12, alignItems: 'center' },
  searchButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  recentSection: { marginTop: 32 },
  emptyText: { color: '#666', fontStyle: 'italic' },
});
