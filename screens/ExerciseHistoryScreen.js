import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getHistoryForExercise, estimate1RM } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function ExerciseHistoryScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(getHistoryForExercise(exerciseId)); }, []);

  const bestSet = history.reduce((best, s) => (s.weight > (best?.weight || 0) ? s : best), null);
  const chartData = history.map((s) => estimate1RM(s.weight, s.reps));
  const chartLabels = history.map((s) => s.date.slice(5));
  const hasEnoughData = chartData.length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exerciseName}</Text>

      {bestSet && (
        <View style={styles.prCard}>
          <Text style={styles.prLabel}>Personal Best</Text>
          <Text style={styles.prValue}>{bestSet.weight}kg × {bestSet.reps} reps</Text>
        </View>
      )}

      {hasEnoughData && (
        <View style={styles.chartContainer}>
          <LineChart
            data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundColor: PALETTE.surface,
              backgroundGradientFrom: PALETTE.surface,
              backgroundGradientTo: PALETTE.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 210, 211, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: PALETTE.accent },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      )}

      {!hasEnoughData && history.length > 0 && (
        <Text style={styles.emptyText}>Log a few more sets to see your progress chart.</Text>
      )}

      <FlatList
        style={{ marginTop: 20 }}
        data={history}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowDate}>{item.date}</Text>
            <Text style={styles.rowValue}>{item.weight}kg × {item.reps}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history yet for this exercise.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: PALETTE.textMain },
  
  prCard: { backgroundColor: PALETTE.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.accent, marginBottom: 20 },
  prLabel: { color: PALETTE.textMuted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  prValue: { color: PALETTE.accent, fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  
  chartContainer: { backgroundColor: PALETTE.surface, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: PALETTE.border, alignItems: 'center' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  rowDate: { fontSize: 15, color: PALETTE.textMuted },
  rowValue: { fontSize: 16, fontWeight: 'bold', color: PALETTE.textMain },
  
  emptyText: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
});