import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getExercisesForRoutine } from '../database/db';

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId, routineName } = route.params;
  const [exercises, setExercises] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setExercises(getExercisesForRoutine(routineId));
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routineName}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ExercisePicker', { routineId })}
      >
        <Text style={styles.addButtonText}>+ Add Exercise to Routine</Text>
      </TouchableOpacity>

      <FlatList
        style={{ marginTop: 16 }}
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.exerciseRow}>{index + 1}. {item.name}</Text>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No exercises added yet.</Text>}
      />

      {exercises.length > 0 && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('StartRoutine', { routineId, routineName })}
        >
          <Text style={styles.startButtonText}>Start Workout with This Routine</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  addButton: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, alignItems: 'center' },
  addButtonText: { fontWeight: '600' },
  exerciseRow: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 20 },
  startButton: { backgroundColor: '#000', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});