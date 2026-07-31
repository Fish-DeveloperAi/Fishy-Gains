import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getExercisesForRoutine } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function EditRoutineScreen({ route, navigation }) {
  const { routineId, routineName } = route.params;
  const [exercises, setExercises] = useState([]);

  useFocusEffect(
    useCallback(() => { setExercises(getExercisesForRoutine(routineId)); }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routineName}</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ExercisePicker', { routineId })}>
        <Text style={styles.addButtonText}>+ Add Exercise to Routine</Text>
      </TouchableOpacity>

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
          ListEmptyComponent={<Text style={styles.emptyText}>No exercises added yet.</Text>}
        />
      </View>

      {exercises.length > 0 && (
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('StartRoutine', { routineId, routineName })}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: PALETTE.textMain },
  
  addButton: { backgroundColor: PALETTE.surface, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: PALETTE.accent },
  addButtonText: { fontWeight: 'bold', color: PALETTE.accent, fontSize: 15 },
  
  listContainer: { flex: 1, marginTop: 20, backgroundColor: PALETTE.surface, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: PALETTE.border },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  exerciseNumber: { color: PALETTE.accent, fontWeight: 'bold', width: 24, fontSize: 16 },
  exerciseName: { fontSize: 16, color: PALETTE.textMain, fontWeight: '500' },
  
  emptyText: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  
  startButton: { backgroundColor: PALETTE.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  startButtonText: { color: '#0B1D3A', fontWeight: 'bold', fontSize: 16 },
});