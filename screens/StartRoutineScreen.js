import { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { createWorkout, getExercisesForRoutine } from '../database/db';

export default function StartRoutineScreen({ route, navigation }) {
  const { routineId, routineName } = route.params;
  const exercises = getExercisesForRoutine(routineId);

  function handleStart() {
    const workoutId = createWorkout();
    // Navigate straight into the first exercise
    navigation.navigate('LogWorkout', { exercise: exercises[0], workoutId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routineName}</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.exerciseRow}>{index + 1}. {item.name}</Text>
        )}
      />
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Begin Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  exerciseRow: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  startButton: { backgroundColor: '#000', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});