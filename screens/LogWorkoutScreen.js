import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  getRoutineExercises,
  getSetsForWorkoutExercise,
  addSet,
  updateSet,
  deleteSet,
  getPreviousPerformance,
  getRoutineById,
} from '../database/db';
import { useTheme } from '../theme/ThemeContext';

const DEFAULT_REST_SECONDS = 90;

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function LogWorkoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { workoutId, routineId } = route.params;

  const [sessionExercises, setSessionExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(route.params.exerciseIndex || 0);
  const [sets, setSets] = useState([]);
  const [previousSets, setPreviousSets] = useState([]);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [editingSetId, setEditingSetId] = useState(null);
  const [routineName, setRoutineName] = useState('Freestyle Workout');

  const startTimeRef = useRef(Date.now());
  const restEndRef = useRef(null);

  useEffect(() => {
    if (routineId) {
      const routine = getRoutineById(routineId);
      if (routine) setRoutineName(routine.name);
      const routineExercises = getRoutineExercises(routineId).map((e) => ({
        exerciseId: e.id,
        name: e.name,
        muscleGroup: e.muscle_group,
        category: e.category,
        targetSets: e.target_sets,
      }));
      setSessionExercises(routineExercises);
    } else {
      setRoutineName('Freestyle Workout');
    }
  }, [routineId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval;
    if (restRunning) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.round((restEndRef.current - Date.now()) / 1000));
        setRestRemaining(remaining);
        if (remaining <= 0) {
          setRestRunning(false);
        }
      }, 500);
    }
    return () => interval && clearInterval(interval);
  }, [restRunning]);

  useEffect(() => {
    if (route.params?.selectedExercises) {
      handleAddFreestyleExercises(route.params.selectedExercises);
      navigation.setParams({ selectedExercises: undefined });
    }
  }, [route.params?.selectedExercises]);

  const currentExercise = sessionExercises[currentIndex];

  const loadSetsForCurrent = useCallback(() => {
    if (!currentExercise) {
      setSets([]);
      setPreviousSets([]);
      return;
    }
    setSets(getSetsForWorkoutExercise(workoutId, currentExercise.exerciseId));
    setPreviousSets(getPreviousPerformance(currentExercise.exerciseId, workoutId));
  }, [currentExercise, workoutId]);

  useEffect(() => {
    loadSetsForCurrent();
    setWeightInput('');
    setRepsInput('');
    setEditingSetId(null);
  }, [loadSetsForCurrent]);

  const startRestTimer = (durationSeconds = DEFAULT_REST_SECONDS) => {
    restEndRef.current = Date.now() + durationSeconds * 1000;
    setRestRemaining(durationSeconds);
    setRestRunning(true);
  };

  const adjustRest = (deltaSeconds) => {
    if (!restEndRef.current) {
      startRestTimer(Math.max(0, DEFAULT_REST_SECONDS + deltaSeconds));
      return;
    }
    restEndRef.current += deltaSeconds * 1000;
    const remaining = Math.max(0, Math.round((restEndRef.current - Date.now()) / 1000));
    setRestRemaining(remaining);
  };

  const togglePauseRest = () => {
    if (restRunning) {
      setRestRunning(false);
    } else if (restRemaining > 0) {
      restEndRef.current = Date.now() + restRemaining * 1000;
      setRestRunning(true);
    }
  };

  const stopRest = () => {
    setRestRunning(false);
    setRestRemaining(0);
    restEndRef.current = null;
  };

  const handleLogSet = () => {
    const weight = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (isNaN(weight) || weight < 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    if (isNaN(reps) || reps <= 0) {
      Alert.alert('Invalid Reps', 'Please enter a valid number of reps.');
      return;
    }
    if (editingSetId) {
      updateSet(editingSetId, weight, reps);
      setEditingSetId(null);
    } else {
      addSet(workoutId, currentExercise.exerciseId, sets.length, weight, reps);
      startRestTimer(DEFAULT_REST_SECONDS);
    }
    setWeightInput('');
    setRepsInput('');
    loadSetsForCurrent();
  };

  const handleEditSet = (set) => {
    setEditingSetId(set.id);
    setWeightInput(String(set.weight));
    setRepsInput(String(set.reps));
  };

  const handleDeleteSet = (setId) => {
    deleteSet(setId);
    if (editingSetId === setId) {
      setEditingSetId(null);
      setWeightInput('');
      setRepsInput('');
    }
    loadSetsForCurrent();
  };

  const handleAddFreestyleExercises = (chosenExercises) => {
    setSessionExercises((prev) => {
      const additions = chosenExercises
        .filter((ex) => !prev.some((p) => p.exerciseId === ex.id))
        .map((ex) => ({
          exerciseId: ex.id,
          name: ex.name,
          muscleGroup: ex.muscle_group,
          category: ex.category,
          targetSets: 3,
        }));
      const combined = [...prev, ...additions];
      if (prev.length === 0 && additions.length > 0) {
        setCurrentIndex(0);
      }
      return combined;
    });
  };

  const goToNextExercise = () => {
    if (currentIndex < sessionExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('FinishWorkout', { workoutId, durationSeconds: elapsedSeconds });
    }
  };

  const goToPrevExercise = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you ready to finish this workout?', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Finish',
        onPress: () => navigation.replace('FinishWorkout', { workoutId, durationSeconds: elapsedSeconds }),
      },
    ]);
  };

  const isLastExercise = currentIndex >= sessionExercises.length - 1;
  const restProgress = restRemaining > 0 ? restRemaining / DEFAULT_REST_SECONDS : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.routineName} numberOfLines={1}>{routineName}</Text>
          <View style={styles.timerRow}>
            <Ionicons name="stopwatch-outline" size={14} color={colors.accent} />
            <Text style={styles.timerText}>{formatClock(elapsedSeconds)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.finishTopButton} onPress={handleFinish}>
          <Text style={styles.finishTopButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {sessionExercises.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseTabs}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {sessionExercises.map((ex, idx) => (
            <TouchableOpacity
              key={ex.exerciseId}
              style={[styles.exerciseTab, idx === currentIndex && styles.exerciseTabActive]}
              onPress={() => setCurrentIndex(idx)}
            >
              <Text style={[styles.exerciseTabText, idx === currentIndex && styles.exerciseTabTextActive]} numberOfLines={1}>
                {ex.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {!currentExercise ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No exercises yet</Text>
              <Text style={styles.emptyStateSubtext}>Add an exercise to start logging sets.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
              <Text style={styles.exerciseSubtitle}>
                {currentExercise.muscleGroup} · {currentExercise.category} · Target {currentExercise.targetSets} sets
              </Text>

              {restRemaining > 0 && (
                <View style={styles.restCard}>
                  <View style={styles.restHeaderRow}>
                    <Text style={styles.restLabel}>REST TIMER</Text>
                    <TouchableOpacity onPress={stopRest}>
                      <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.restClock}>{formatClock(restRemaining)}</Text>
                  <View style={styles.restProgressTrack}>
                    <View style={[styles.restProgressFill, { width: `${Math.min(100, restProgress * 100)}%` }]} />
                  </View>
                  <View style={styles.restControlsRow}>
                    <TouchableOpacity style={styles.restControlButton} onPress={() => adjustRest(-15)}>
                      <Text style={styles.restControlText}>-15s</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.restControlButtonPrimary} onPress={togglePauseRest}>
                      <Ionicons name={restRunning ? 'pause' : 'play'} size={18} color={colors.background} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.restControlButton} onPress={() => adjustRest(15)}>
                      <Text style={styles.restControlText}>+15s</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.setsTableHeader}>
                <Text style={[styles.setsHeaderCell, { flex: 0.6 }]}>SET</Text>
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>PREVIOUS</Text>
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>WEIGHT</Text>
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>REPS</Text>
                <View style={{ width: 30 }} />
              </View>

              {sets.map((set, idx) => {
                const prev = previousSets[idx];
                return (
                  <TouchableOpacity
                    key={set.id}
                    style={[styles.setRow, editingSetId === set.id && styles.setRowEditing]}
                    onPress={() => handleEditSet(set)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.setIndexText}>{idx + 1}</Text>
                      {set.is_pr === 1 && <Ionicons name="trophy" size={13} color={colors.accent} style={{ marginLeft: 4 }} />}
                    </View>
                    <Text style={[styles.setCellText, { flex: 1 }]}>
                      {prev ? `${prev.weight} × ${prev.reps}` : '—'}
                    </Text>
                    <Text style={[styles.setCellText, { flex: 1, fontWeight: '700' }]}>{set.weight}</Text>
                    <Text style={[styles.setCellText, { flex: 1, fontWeight: '700' }]}>{set.reps}</Text>
                    <TouchableOpacity style={{ width: 30, alignItems: 'center' }} onPress={() => handleDeleteSet(set.id)}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.inputRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder={previousSets[sets.length] ? String(previousSets[sets.length].weight) : '0'}
                    placeholderTextColor={colors.textSecondary}
                    value={weightInput}
                    onChangeText={setWeightInput}
                  />
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>REPS</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder={previousSets[sets.length] ? String(previousSets[sets.length].reps) : '0'}
                    placeholderTextColor={colors.textSecondary}
                    value={repsInput}
                    onChangeText={setRepsInput}
                  />
                </View>
                <TouchableOpacity style={styles.logButton} onPress={handleLogSet}>
                  <Ionicons name={editingSetId ? 'checkmark' : 'add'} size={22} color={colors.background} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.addExerciseInline}
                onPress={() =>
                  navigation.navigate('ExercisePicker', { returnScreen: 'LogWorkout' })
                }
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={styles.addExerciseInlineText}>Add Exercise</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {currentExercise && (
          <View style={styles.footer}>
            {currentIndex > 0 && (
              <TouchableOpacity style={styles.navButtonSecondary} onPress={goToPrevExercise}>
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.navButtonPrimary} onPress={goToNextExercise}>
              <Text style={styles.navButtonPrimaryText}>
                {isLastExercise ? 'Finish Workout' : 'Next Exercise'}
              </Text>
              <Ionicons name={isLastExercise ? 'checkmark-circle' : 'chevron-forward'} size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  routineName: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', maxWidth: 220 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timerText: { color: colors.accent, fontSize: 13, fontWeight: '700', marginLeft: 5 },
  finishTopButton: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  finishTopButtonText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },
  exerciseTabs: { flexGrow: 0, marginBottom: 8 },
  exerciseTab: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    maxWidth: 160,
  },
  exerciseTabActive: { backgroundColor: colors.accent },
  exerciseTabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  exerciseTabTextActive: { color: colors.background },
  scrollContent: { padding: 20, paddingBottom: 20 },
  exerciseTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  exerciseSubtitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 16 },
  restCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  restHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  restLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  restClock: { color: colors.textPrimary, fontSize: 40, fontWeight: '800', marginVertical: 6 },
  restProgressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
    marginBottom: 14,
  },
  restProgressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  restControlsRow: { flexDirection: 'row', alignItems: 'center' },
  restControlButton: {
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  restControlText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },
  restControlButtonPrimary: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsTableHeader: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  setsHeaderCell: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  setRowEditing: { borderWidth: 1.5, borderColor: colors.accent },
  setIndexText: { color: colors.textSecondary, fontWeight: '700', fontSize: 13 },
  setCellText: { color: colors.textPrimary, fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  inputBox: { flex: 1, marginRight: 10 },
  inputLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  logButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExerciseInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
    borderStyle: 'dashed',
  },
  addExerciseInlineText: { color: colors.accent, fontWeight: '700', fontSize: 14, marginLeft: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,141,175,0.15)',
  },
  navButtonSecondary: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  navButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  navButtonPrimaryText: { color: colors.background, fontWeight: '800', fontSize: 15, marginRight: 6 },
});