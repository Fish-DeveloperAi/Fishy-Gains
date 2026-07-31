import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { createWorkout, getExercisesForRoutine } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function StartRoutineScreen({ route, navigation }) {
  const { routineId, routineName } = route.params;
  const exercises = getExercisesForRoutine(routineId);

  function handleStart() {
    const workoutId = createWorkout();
    navigation.navigate('LogWorkout', { exercise: exercises[0], workoutId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routineName}</Text>
      
      <View style={styles.listContainer}>
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.exerciseRow}>
              <Text style={styles.exerciseNumber}>{index + 1}.</Text>
              <Text style={styles.exerciseName}>{item.name}</Text>
            </View>
          )}
        />
      </View>
      
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Begin Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: PALETTE.textMain },
  
  listContainer: { flex: 1, backgroundColor: PALETTE.surface, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: PALETTE.border },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  exerciseNumber: { color: PALETTE.accent, fontWeight: 'bold', width: 24, fontSize: 16 },
  exerciseName: { fontSize: 16, color: PALETTE.textMain, fontWeight: '500' },
  
  startButton: { backgroundColor: PALETTE.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  startButtonText: { color: '#0B1D3A', fontWeight: 'bold', fontSize: 16 },
});