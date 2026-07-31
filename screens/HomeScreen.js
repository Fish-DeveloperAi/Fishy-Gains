import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createWorkout, getAllWorkouts, getExercisesForWorkout, getVolumeForWorkout } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function HomeScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  function loadWorkouts() {
    const allWorkouts = getAllWorkouts();
    const withDetails = allWorkouts.map((w) => ({
      ...w,
      exercises: getExercisesForWorkout(w.id),
      volume: getVolumeForWorkout(w.id),
    }));
    setWorkouts(withDetails);
  }

  function handleStartWorkout() {
    const workoutId = createWorkout();
    navigation.navigate('ExercisePicker', { workoutId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleStartWorkout}>
        <Text style={styles.primaryButtonText}>+ Start New Workout</Text>
      </TouchableOpacity>
      
      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Routines')}>
          <Text style={styles.secondaryButtonText}>My Routines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('BodyLog')}>
          <Text style={styles.secondaryButtonText}>Body Log</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={{ marginTop: 24 }}
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.workoutDate}>{item.date}</Text>
              <Text style={styles.volumeText}>
                {item.volume.totalSets} sets · {item.volume.totalVolume.toLocaleString()}kg
              </Text>
            </View>
            
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
  container: { flex: 1, padding: 20, paddingTop: 30, backgroundColor: PALETTE.background },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: PALETTE.textMain },
  
  primaryButton: { backgroundColor: PALETTE.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, shadowColor: PALETTE.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#0B1D3A', fontSize: 16, fontWeight: 'bold' },
  
  rowButtons: { flexDirection: 'row', gap: 12 },
  secondaryButton: { flex: 1, backgroundColor: PALETTE.surface, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: PALETTE.border },
  secondaryButtonText: { fontWeight: '600', fontSize: 15, color: PALETTE.textMain },
  
  workoutCard: { backgroundColor: PALETTE.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: PALETTE.border },
  cardHeader: { borderBottomWidth: 1, borderBottomColor: PALETTE.border, paddingBottom: 10, marginBottom: 10 },
  workoutDate: { fontSize: 16, fontWeight: 'bold', color: PALETTE.textMain },
  volumeText: { fontSize: 13, color: PALETTE.accent, marginTop: 4, fontWeight: '600' },
  workoutExercises: { fontSize: 13, color: PALETTE.textMuted, fontStyle: 'italic' },
  
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: PALETTE.background, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: PALETTE.border },
  chipText: { color: PALETTE.textMain, fontSize: 12, fontWeight: '500' },
  
  emptyText: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 30 },
});