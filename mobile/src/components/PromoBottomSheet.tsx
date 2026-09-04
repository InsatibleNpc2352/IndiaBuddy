import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PromoBottomSheet({ visible, onClose }: Props) {
  const promos = [
    { id: '1', code: 'FLY20', desc: '20% off on domestic flights', mode: 'Flight' },
    { id: '2', code: 'TRAIN10', desc: '10% off on AC trains', mode: 'Train' },
  ];

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Promo Codes</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
          </View>
          
          <FlatList
            data={promos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.promoCard}>
                <View>
                  <Text style={styles.code}>{item.code}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn}>
                  <Text style={styles.copyText}>COPY</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  handle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeText: { color: '#FF5A5F', fontWeight: 'bold' },
  promoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 12 },
  code: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  desc: { color: '#666', marginTop: 4 },
  copyBtn: { backgroundColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4 },
  copyText: { fontWeight: 'bold', fontSize: 12 },
});
