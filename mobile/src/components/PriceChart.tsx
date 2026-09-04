import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryTheme, VictoryAxis } from 'victory-native';

export default function PriceChart() {
  const data = [
    { x: 1, y: 4000, y0: 3800, y1: 4200 },
    { x: 2, y: 4100, y0: 3900, y1: 4300 },
    { x: 3, y: 3900, y0: 3700, y1: 4100 },
    { x: 4, y: 4500, y0: 4200, y1: 4800 },
    { x: 5, y: 4300, y0: 4000, y1: 4600 },
  ];

  return (
    <View style={styles.container}>
      <VictoryChart theme={VictoryTheme.material} height={200} padding={{ top: 20, bottom: 40, left: 50, right: 20 }}>
        <VictoryAxis tickFormat={(t) => `D${t}`} style={{ tickLabels: { fontSize: 10 } }} />
        <VictoryAxis dependentAxis tickFormat={(t) => `₹${t}`} style={{ tickLabels: { fontSize: 10 } }} />
        <VictoryArea
          data={data}
          y0="y0"
          y="y1"
          style={{ data: { fill: "#FFCDD2", opacity: 0.5 } }}
        />
        <VictoryLine
          data={data}
          style={{ data: { stroke: "#FF5A5F", strokeWidth: 2 } }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
});
