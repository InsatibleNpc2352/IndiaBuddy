import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function ProfileScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
        <Text style={styles.name}>Traveller</Text>
        <Text style={styles.email}>user@example.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Use Face ID / Fingerprint</Text>
          <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Routes</Text>
        <Text style={styles.emptyText}>No saved routes.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Price Alerts</Text>
        <Text style={styles.emptyText}>No active alerts.</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>App Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF5A5F', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold' },
  email: { color: '#666' },
  section: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  settingText: { fontSize: 16 },
  emptyText: { color: '#999', fontStyle: 'italic' },
  logoutButton: { padding: 16, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#FF5A5F', fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#999', marginTop: 20 },
});
