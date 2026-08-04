import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getRoutineById, getRoutineExercises, createWorkout } from '../database/db';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// Shared DB-value translator (muscle groups, categories, equipment).
import { translateValue } from '../utils/i18nKeys';


export default function StartRoutineScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          <Text style={styles.emptyStateText}>{t('routineNotFound')}</Text>
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
                <Ionicons name="barbell-outline" size={14} color={colors.accent} />
                <Text style={styles.summaryText}>{exercises.length} {t('exercises') ? t('exercises').toLowerCase() : 'exercises'}</Text>
              </View>
              <View style={styles.summaryPill}>
                <Ionicons name="layers-outline" size={14} color={colors.accent} />
                <Text style={styles.summaryText}>{totalSets} {t('sets').toLowerCase()}</Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>{t('exerciseOrder').toUpperCase()}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{t('routineNoExercises')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditRoutine', { routineId })}>
              <Text style={styles.editLink}>{t('editRoutine')}</Text>
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
              <Text style={styles.exerciseMeta}>{item.target_sets} {t('sets').toLowerCase()} · {translateValue(item.muscle_group, t)}</Text>
            </View>
          </View>
        )}
      />
      {exercises.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={20} color={colors.background} />
            <Text style={styles.startButtonText}>{t('startWorkout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 110 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', marginBottom: 20 },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  summaryText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  indexCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,141,175,0.15)',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  startButtonText: { color: colors.background, fontWeight: '800', fontSize: 16, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  editLink: { color: colors.accent, fontWeight: '700', fontSize: 14, marginTop: 12 },
});