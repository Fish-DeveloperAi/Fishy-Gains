import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getExerciseById, getExerciseHistory, getExercisePRs } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

function formatDate(dateString) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExerciseHistoryScreen({ route, navigation }) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState(null);
  const [history, setHistory] = useState([]);
  const [prs, setPrs] = useState({ maxWeight: 0, maxWeightReps: 0, maxVolume: 0, estimated1RM: 0 });

  const loadData = useCallback(() => {
    const ex = getExerciseById(exerciseId);
    setExercise(ex);
    if (ex) navigation.setOptions({ title: ex.name });
    setHistory(getExerciseHistory(exerciseId));
    setPrs(getExercisePRs(exerciseId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const chartWorkouts = history.slice(0, 10).reverse();
  const maxTopSet = Math.max(1, ...chartWorkouts.map((w) => Math.max(...w.sets.map((s) => s.weight), 0)));

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.workoutId)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {exercise && (
              <Text style={styles.exerciseMeta}>{exercise.muscle_group} · {exercise.category}</Text>
            )}

            <View style={styles.prGrid}>
              <View style={styles.prCard}>
                <Ionicons name="trophy" size={18} color={COLORS.accent} />
                <Text style={styles.prValue}>{prs.maxWeight || 0} lb</Text>
                <Text style={styles.prLabel}>Best Weight{prs.maxWeightReps ? ` × ${prs.maxWeightReps}` : ''}</Text>
              </View>
              <View style={styles.prCard}>
                <Ionicons name="stats-chart" size={18} color={COLORS.accent} />
                <Text style={styles.prValue}>{Math.round(prs.maxVolume || 0).toLocaleString()}</Text>
                <Text style={styles.prLabel}>Best Set Volume</Text>
              </View>
              <View style={styles.prCard}>
                <Ionicons name="rocket" size={18} color={COLORS.accent} />
                <Text style={styles.prValue}>{prs.estimated1RM || 0} lb</Text>
                <Text style={styles.prLabel}>Est. 1RM</Text>
              </View>
            </View>

            {chartWorkouts.length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.sectionLabel}>STRENGTH PROGRESSION</Text>
                <View style={styles.chartRow}>
                  {chartWorkouts.map((w, idx) => {
                    const topSet = Math.max(...w.sets.map((s) => s.weight), 0);
                    const heightPct = (topSet / maxTopSet) * 70 + 6;
                    return (
                      <View key={idx} style={styles.chartCol}>
                        <View style={[styles.chartBar, { height: heightPct }]} />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={styles.sectionLabel}>WORKOUT HISTORY</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No history for this exercise yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
            {item.sets.map((set, idx) => (
              <View key={set.id} style={styles.historySetRow}>
                <Text style={styles.historySetIndex}>Set {idx + 1}</Text>
                <Text style={styles.historySetValue}>
                  {set.weight} lb × {set.reps}
                  {set.is_pr === 1 ? '  🏆' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 20, paddingBottom: 40 },
  exerciseMeta: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 16 },
  prGrid: { flexDirection: 'row', marginBottom: 16 },
  prCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginRight: 8,
    alignItems: 'flex-start',
  },
  prValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 8 },
  prLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600', marginTop: 2 },
  chartCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 20 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 80, justifyContent: 'space-between' },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 80 },
  chartBar: { width: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  historyCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 10 },
  historyDate: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  historySetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  historySetIndex: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  historySetValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
});