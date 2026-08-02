import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { getExerciseById, getExerciseHistory, getExercisePRs } from '../database/db';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

export default function ExerciseHistoryScreen({ route, navigation }) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState(null);
  const [history, setHistory] = useState([]);
  const [prs, setPrs] = useState({ maxWeight: 0, maxWeightReps: 0, maxVolume: 0, estimated1RM: 0 });

  const loadData = useCallback(() => {
    const ex = getExerciseById(exerciseId);
    setExercise(ex);
    
    // Updated to match the "Progress" header in your screenshot
    if (ex) navigation.setOptions({ title: 'Progress' });
    
    setHistory(getExerciseHistory(exerciseId));
    setPrs(getExercisePRs(exerciseId));
  }, [exerciseId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Flatten the grouped workout history into individual sets for the minimalist list and chart
  const flattenedHistory = [];
  history.forEach(workout => {
    workout.sets.forEach(set => {
      flattenedHistory.push({
        ...set,
        date: workout.date,
      });
    });
  });

  // Grab the most recent 10 sets for the chart and reverse them for left-to-right chronological order
  const chartSets = flattenedHistory.slice(0, 10).reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={flattenedHistory}
        keyExtractor={(item) => String(item.id)} 
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {exercise && (
              <Text style={styles.screenTitle}>{exercise.name}</Text>
            )}

            {prs.maxWeight > 0 && (
              <View style={styles.pbCard}>
                <Text style={styles.pbLabel}>PERSONAL BEST</Text>
                <Text style={styles.pbValue}>
                  {prs.maxWeight}kg <Text style={styles.pbReps}>× {prs.maxWeightReps} reps</Text>
                </Text>
              </View>
            )}

            {chartSets.length > 1 && (
              <View style={styles.lineChartCard}>
                <LineChart
                  data={{
                    labels: chartSets.map((s) => {
                      const d = new Date(s.date.replace(' ', 'T'));
                      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    }),
                    datasets: [
                      {
                        data: chartSets.map((s) => s.weight),
                      },
                    ],
                  }}
                  width={screenWidth - 40} // Accounts for 20px padding on each side
                  height={220}
                  yAxisSuffix="kg"
                  withVerticalLines={false}
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: COLORS.card,
                    backgroundGradientFrom: COLORS.card,
                    backgroundGradientTo: COLORS.card,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 210, 211, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(124, 141, 175, ${opacity})`,
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: COLORS.accent,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '4 4',
                      stroke: 'rgba(124,141,175,0.15)',
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 18,
                  }}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No history for this exercise yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          // Extracts just the YYYY-MM-DD part to match your screenshot
          const displayDate = item.date ? item.date.split(' ')[0] : ''; 
          
          return (
            <View style={styles.minimalRowContainer}>
              <Text style={styles.minimalRowDate}>{displayDate}</Text>
              <Text style={styles.minimalRowWeight}>
                {item.weight}kg <Text style={styles.minimalRowReps}>× {item.reps}</Text>
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pbCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 211, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pbLabel: {
    color: 'rgba(124, 141, 175, 0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pbValue: {
    color: '#00d2d3',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pbReps: {
    fontSize: 18,
    fontWeight: '600',
  },
  lineChartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 24, 
    overflow: 'hidden',
  },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 32 
  },
  emptyStateText: { 
    color: COLORS.textSecondary, 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 10, 
    textAlign: 'center' 
  },
  minimalRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 141, 175, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  minimalRowDate: {
    color: 'rgba(124, 141, 175, 0.8)',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  minimalRowWeight: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  minimalRowReps: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});