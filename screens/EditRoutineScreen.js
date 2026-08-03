import React, { useCallback, useLayoutEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  getRoutineById,
  renameRoutine,
  getRoutineExercises,
  removeExerciseFromRoutine,
  reorderRoutineExercises,
  updateRoutineExerciseTargetSets,
  deleteRoutine,
} from '../database/db';
import { useTheme } from '../theme/ThemeContext';

export default function EditRoutineScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { routineId } = route.params;
  const [routineName, setRoutineName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [exercises, setExercises] = useState([]);

  const loadData = useCallback(() => {
    const routine = getRoutineById(routineId);
    if (routine) setRoutineName(routine.name);
    setExercises(getRoutineExercises(routineId));
  }, [routineId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDeleteRoutine}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, routineId, routineName, colors]);

  const handleDeleteRoutine = () => {
    Alert.alert('Delete Routine', `Delete "${routineName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(routineId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSaveName = () => {
    const trimmed = routineName.trim();
    if (trimmed.length > 0) {
      renameRoutine(routineId, trimmed);
    } else {
      const routine = getRoutineById(routineId);
      setRoutineName(routine ? routine.name : '');
    }
    setEditingName(false);
  };

  const handleRemoveExercise = (routineExerciseId) => {
    removeExerciseFromRoutine(routineExerciseId);
    loadData();
  };

  const handleMove = (index, direction) => {
    const newExercises = [...exercises];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newExercises.length) return;
    const temp = newExercises[index];
    newExercises[index] = newExercises[targetIndex];
    newExercises[targetIndex] = temp;
    setExercises(newExercises);
    reorderRoutineExercises(newExercises.map((e) => e.routine_exercise_id));
  };

  const adjustTargetSets = (routineExerciseId, current, delta) => {
    const newValue = Math.max(1, Math.min(10, current + delta));
    updateRoutineExerciseTargetSets(routineExerciseId, newValue);
    setExercises((prev) =>
      prev.map((e) => (e.routine_exercise_id === routineExerciseId ? { ...e, target_sets: newValue } : e))
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.routine_exercise_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={routineName}
                onChangeText={setRoutineName}
                autoFocus
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
              />
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.nameRow}>
                <Text style={styles.nameText}>{routineName}</Text>
                <Ionicons name="pencil" size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}
            <Text style={styles.sectionLabel}>EXERCISES</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No exercises added yet</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.exerciseCard}>
            <View style={styles.reorderCol}>
              <TouchableOpacity
                onPress={() => handleMove(index, -1)}
                disabled={index === 0}
                style={styles.reorderButton}
              >
                <Ionicons name="chevron-up" size={16} color={index === 0 ? 'rgba(124,141,175,0.3)' : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMove(index, 1)}
                disabled={index === exercises.length - 1}
                style={styles.reorderButton}
              >
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={index === exercises.length - 1 ? 'rgba(124,141,175,0.3)' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseMeta}>{item.muscle_group} · {item.category}</Text>
            </View>
            <View style={styles.setsStepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => adjustTargetSets(item.routine_exercise_id, item.target_sets, -1)}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{item.target_sets}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => adjustTargetSets(item.routine_exercise_id, item.target_sets, 1)}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveExercise(item.routine_exercise_id)}
            >
              <Ionicons name="close-circle" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ExercisePicker', { routineId })}
          >
            <Ionicons name="add-circle" size={20} color={colors.accent} />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  nameText: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  nameInput: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 4,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderCol: { marginRight: 8 },
  reorderButton: { paddingVertical: 2 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  setsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 4,
    marginRight: 8,
  },
  stepperButton: { padding: 8 },
  stepperValue: { color: colors.textPrimary, fontWeight: '700', fontSize: 14, minWidth: 18, textAlign: 'center' },
  removeButton: { padding: 4 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: { color: colors.accent, fontWeight: '700', fontSize: 14, marginLeft: 8 },
});