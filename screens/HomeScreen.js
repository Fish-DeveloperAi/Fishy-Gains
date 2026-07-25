import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createWorkout, getAllWorkouts, getExercisesForWorkout } from '../database/db';

export default function HomeScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  function loadWorkouts() {
  const allWorkouts = getAllWorkouts();
  const withExercises = allWorkouts.map((w) => ({
    ...w,
    exercises: getExercisesForWorkout(w.id),
  }));
  setWorkouts(withExercises);
} 

  function handleStartWorkout() {
    const workoutId = createWorkout();
    navigation.navigate('ExercisePicker', { workoutId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      <TouchableOpacity style={styles.button} onPress={handleStartWorkout}>
        <Text style={styles.buttonText}>+ Start New Workout</Text>
      </TouchableOpacity>

      <FlatList
        style={{ marginTop: 24 }}
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
  <View style={styles.workoutCard}>
    <Text style={styles.workoutDate}>{item.date}</Text>
    <View style={styles.chipRow}>
      {item.exercises.length === 0 ? (
        <Text style={styles.workoutExercises}>No exercises logged</Text>
      ) : (
        item.exercises.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            style={styles.chip}
            onPress={() => navigation.navigate('ExerciseHistory', { exerciseId: ex.id, exerciseName: ex.name })}
          >
            <Text style={styles.chipText}>{ex.name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  </View>
)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workouts yet — start your first one above.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  workoutCard: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutDate: { fontSize: 15, fontWeight: '600' },
  workoutExercises: { fontSize: 13, color: '#777', marginTop: 4, textTransform: 'capitalize' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 30 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { backgroundColor: '#000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});