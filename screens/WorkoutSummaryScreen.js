import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { getWorkoutDetail } from '../database/db';
import { useTheme } from '../theme/ThemeContext';

const screenWidth = Dimensions.get('window').width;

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function formatDate(dateString) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WorkoutSummaryScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const data = getWorkoutDetail(workoutId);
      setWorkout(data);
      if (data) {
        navigation.setOptions({ title: 'Workout Summary' });
      }
    }, [workoutId, navigation])
  );

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading workout details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{formatDuration(workout.duration_seconds)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="barbell-outline" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{Math.round(workout.totalVolume).toLocaleString()} kg</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="layers-outline" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{workout.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trophy-outline" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{workout.prCount}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>EXERCISES PERFORMED</Text>

        {/* Exercises List */}
        {workout.exercises.map((exercise, index) => {
          // Prepare data for the mini line chart (Weight progression across sets)
          const setWeights = exercise.sets.map(s => s.weight || 0);
          const setLabels = exercise.sets.map((_, i) => `${i + 1}`);

          return (
            <View key={exercise.exerciseId} style={styles.exerciseCard}>
              
              {/* Clickable Header routes to the full Progress screen */}
              <TouchableOpacity 
                style={styles.exerciseHeader}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExerciseHistory', { exerciseId: exercise.exerciseId })}
              >
                <View style={styles.indexCircle}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Mini Line Chart */}
              {setWeights.length > 0 && (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: setLabels,
                      datasets: [{ data: setWeights }]
                    }}
                    width={screenWidth - 72} 
                    height={140}
                    chartConfig={{
                      backgroundColor: colors.card,
                      backgroundGradientFrom: colors.card,
                      backgroundGradientTo: colors.card,
                      decimalPlaces: 1,
                      color: () => colors.accent,
                      labelColor: () => colors.textSecondary,
                      style: { borderRadius: 16 },
                      propsForDots: { r: "4", strokeWidth: "2", stroke: colors.accent },
                      propsForBackgroundLines: { strokeDasharray: "4", stroke: "rgba(124, 141, 175, 0.2)" }
                    }}
                    bezier
                    fromZero={false}
                    withVerticalLines={false}
                    style={styles.lineChart}
                  />
                </View>
              )}

              {/* Sets Table */}
              <View style={styles.setsTableHeader}>
                <Text style={[styles.setsHeaderCell, { flex: 0.5 }]}>SET</Text>
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>WEIGHT</Text>
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>REPS</Text>
                <View style={{ width: 24 }} />
              </View>

              {exercise.sets.map((set, setIdx) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setCellText, { flex: 0.5, color: colors.textSecondary }]}>
                    {setIdx + 1}
                  </Text>
                  <Text style={[styles.setCellText, { flex: 1, fontWeight: '700' }]}>
                    {set.weight} kg
                  </Text>
                  <Text style={[styles.setCellText, { flex: 1, fontWeight: '700' }]}>
                    {set.reps}
                  </Text>
                  <View style={{ width: 24, alignItems: 'center' }}>
                    {set.is_pr === 1 && <Ionicons name="trophy" size={16} color={colors.accent} />}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  workoutName: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  workoutDate: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 8 },
  statLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: { color: colors.accent, fontWeight: '800', fontSize: 14 },
  exerciseName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  exerciseMuscle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  chartContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  lineChart: {
    borderRadius: 16,
  },
  setsTableHeader: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  setsHeaderCell: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  setCellText: { color: colors.textPrimary, fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});