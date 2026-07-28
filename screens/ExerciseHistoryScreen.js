import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getHistoryForExercise, estimate1RM } from '../database/db';


export default function ExerciseHistoryScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistoryForExercise(exerciseId));
  }, []);

  const bestSet = history.reduce((best, s) => (s.weight > (best?.weight || 0) ? s : best), null);

  const chartData = history.map((s) => estimate1RM(s.weight, s.reps));
  const chartLabels = history.map((s) => s.date.slice(5));

// Chart needs at least 2 points to draw a line
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
  <LineChart
    data={{
      labels: chartLabels,
      datasets: [{ data: chartData }],
    }}
    width={Dimensions.get('window').width - 40}
    height={220}
    yAxisSuffix="kg"
    chartConfig={{
      backgroundColor: '#fff',
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      propsForDots: { r: '4', strokeWidth: '2', stroke: '#000' },
    }}
    bezier
    style={{ marginVertical: 16, borderRadius: 12 }}
      />
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
            <Text style={styles.rowValue}>{item.weight}kg × {item.reps} reps</Text>
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
  container: { flex: 1, padding: 20, paddingTop: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  prCard: { backgroundColor: '#000', padding: 16, borderRadius: 12 },
  prLabel: { color: '#aaa', fontSize: 13 },
  prValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowDate: { fontSize: 14, color: '#777' },
  rowValue: { fontSize: 15, fontWeight: '600' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 30 },
});