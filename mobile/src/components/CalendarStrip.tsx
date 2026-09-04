import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { format, addDays } from 'date-fns';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function CalendarStrip({ selectedDate, onSelectDate }: Props) {
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      dateString: d.toISOString().split('T')[0],
      day: format(d, 'EEE'),
      date: format(d, 'dd'),
      zone: i < 3 ? 'red' : i < 7 ? 'yellow' : 'green', // Dummy logic
      price: 3000 + (Math.random() * 2000)
    };
  });

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'red': return '#FFCDD2';
      case 'yellow': return '#FFF9C4';
      case 'green': return '#C8E6C9';
      default: return '#eee';
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {dates.map((item) => {
        const isSelected = item.dateString === selectedDate;
        return (
          <TouchableOpacity
            key={item.dateString}
            style={[
              styles.dateBox,
              { backgroundColor: getZoneColor(item.zone) },
              isSelected && styles.selectedBox
            ]}
            onPress={() => onSelectDate(item.dateString)}
          >
            <Text style={[styles.dayText, isSelected && styles.selectedText]}>{item.day}</Text>
            <Text style={[styles.dateText, isSelected && styles.selectedText]}>{item.date}</Text>
            <Text style={styles.priceText}>₹{Math.floor(item.price)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 20 },
  dateBox: { padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center', width: 70, borderWidth: 2, borderColor: 'transparent' },
  selectedBox: { borderColor: '#FF5A5F' },
  dayText: { fontSize: 12, color: '#555' },
  dateText: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  priceText: { fontSize: 10, color: '#333' },
  selectedText: { color: '#FF5A5F' }
});
