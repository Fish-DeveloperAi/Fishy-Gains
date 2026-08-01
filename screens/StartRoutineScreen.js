import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getRoutineById, getRoutineExercises, createWorkout } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

export default function StartRoutineScreen({ route, navigation }) {
  const { routineId } = route.params;
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);

  const loadData = useCallback(() => {
    setRoutine(getRoutineById(routineId));
    setExercises(getRoutineExercises(routineId));
  }, [routineId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalSets = exercises.reduce((sum, e) => sum + e.target_sets, 0);

  const handleStart = () => {
    if (!routine) return;
    const workoutId = createWorkout(routineId, routine.name);
    navigation.replace('LogWorkout', { workoutId, routineId, exerciseIndex: 0 });
  };

  if (!routine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Routine not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.routine_exercise_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{routine.name}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Ionicons name="barbell-outline" size={14} color={COLORS.accent} />
                <Text style={styles.summaryText}>{exercises.length} exercises</Text>
              </View>
              <View style={styles.summaryPill}>
                <Ionicons name="layers-outline" size={14} color={COLORS.accent} />
                <Text style={styles.summaryText}>{totalSets} sets</Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>EXERCISE ORDER</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>This routine has no exercises yet.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditRoutine', { routineId })}>
              <Text style={styles.editLink}>Edit Routine</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.exerciseRow}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseMeta}>{item.target_sets} sets · {item.muscle_group}</Text>
            </View>
          </View>
        )}
      />
      {exercises.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={20} color="#0B1D3A" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 20, paddingBottom: 110 },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', marginBottom: 20 },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  summaryText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  indexCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: { color: COLORS.accent, fontWeight: '800', fontSize: 13 },
  exerciseName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,141,175,0.15)',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  startButtonText: { color: '#0B1D3A', fontWeight: '800', fontSize: 16, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  editLink: { color: COLORS.accent, fontWeight: '700', fontSize: 14, marginTop: 12 },
});