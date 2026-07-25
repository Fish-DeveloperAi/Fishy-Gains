import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getHistoryForExercise } from '../database/db';

export default function ExerciseHistoryScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistoryForExercise(exerciseId));
  }, []);

  const bestSet = history.reduce((best, s) => (s.weight > (best?.weight || 0) ? s : best), null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exerciseName}</Text>

      {bestSet && (
        <View style={styles.prCard}>
          <Text style={styles.prLabel}>Personal Best</Text>
          <Text style={styles.prValue}>{bestSet.weight}kg × {bestSet.reps} reps</Text>
        </View>
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