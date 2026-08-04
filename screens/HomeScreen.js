import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  getWorkoutStats,
  getWeeklyActivity,
  getRecentWorkouts,
  getWorkoutStreak,
  getRecentPRs,
  deleteWorkout,
} from '../database/db';
import OceanRankCard from '../components/OceanRankCard';
import StreakBadge from '../components/StreakBadge'; 
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

// Relative dates are localised: "Today" / "Yesterday" / "3 days ago" all come
// from the dictionary, and older dates use the active locale.
function formatRelativeDate(dateString, t, locale) {
  const d = new Date(String(dateString).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('yesterday');
  if (diffDays < 7) return t('daysAgo', { count: diffDays });
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0, workoutsThisWeek: 0 });
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [recentPRs, setRecentPRs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setStats(getWorkoutStats());
    setWeeklyActivity(getWeeklyActivity());
    setRecentWorkouts(getRecentWorkouts(6));
    setStreak(getWorkoutStreak());
    setRecentPRs(getRecentPRs(3));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 400);
  };

  const maxCount = Math.max(1, ...weeklyActivity.map((d) => d.count));

  const handleDeleteWorkout = (id) => {
    deleteWorkout(id);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl tintColor={colors.accent} refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>{t('welcomeBack')}</Text>
            <Text style={styles.appName}>Fishy Gains 🐟</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Achievements')}>
              <Ionicons name="trophy-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('BodyLog')}>
              <Ionicons name="body-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.streakWrapper}>
          <StreakBadge streakCount={streak} />
        </View>

        <OceanRankCard />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.workoutsThisWeek}</Text>
            <Text style={styles.statLabel}>{t('thisWeek')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>{t('totalWorkouts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(stats.totalVolume).toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('totalVolume')}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('weeklyActivity')}</Text>
          <View style={styles.activityRow}>
            {weeklyActivity.map((day, idx) => {
              const barHeight = day.count > 0 ? 12 + (day.count / maxCount) * 46 : 6;
              const isToday = idx === weeklyActivity.length - 1;
              return (
                <View key={idx} style={styles.activityCol}>
                  <View style={styles.activityBarTrack}>
                    <View
                      style={[
                        styles.activityBar,
                        {
                          height: barHeight,
                          backgroundColor: day.count > 0 ? colors.accent : 'rgba(124,141,175,0.25)',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.activityLabel, isToday && styles.activityLabelToday]}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {recentPRs.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('recentPrs')}</Text>
              <Ionicons name="trophy" size={16} color={colors.accent} />
            </View>
            {recentPRs.map((pr) => (
              <TouchableOpacity 
                key={pr.id} 
                style={styles.prRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExerciseHistory', { exerciseId: pr.exercise_id })}
              >
                <View style={styles.prIconWrap}>
                  <Ionicons name="trending-up" size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prExerciseName}>{pr.exercise_name}</Text>
                  <Text style={styles.prDetail}>{pr.weight} kg × {pr.reps} {t('reps').toLowerCase()}</Text>
                </View>
                <Text style={styles.prDate}>{formatRelativeDate(pr.workout_date, t, locale)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('Routines')}>
            <Ionicons name="play-circle" size={22} color={colors.background} />
            <Text style={styles.primaryActionText}>{t('startWorkout')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleLarge}>{t('recentWorkouts')}</Text>
        </View>

        {recentWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{t('noWorkoutsLogged')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('startRoutineToSee')}</Text>
          </View>
        ) : (
          recentWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('WorkoutSummary', { workoutId: workout.id })}
              onLongPress={() => handleDeleteWorkout(workout.id)}
            >
              <View style={styles.workoutCardHeader}>
                <Text style={styles.workoutCardTitle} numberOfLines={1}>{workout.name}</Text>
                <Text style={styles.workoutCardDate}>{formatRelativeDate(workout.date, t, locale)}</Text>
              </View>
              {workout.muscleGroups.length > 0 && (
                <Text style={styles.workoutCardMuscles} numberOfLines={1}>
                  {workout.muscleGroups.join(' · ')}
                </Text>
              )}
              <View style={styles.workoutCardStatsRow}>
                <View style={styles.workoutCardStat}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.workoutCardStatText}>{formatDuration(workout.duration_seconds)}</Text>
                </View>
                <View style={styles.workoutCardStat}>
                  <Ionicons name="barbell-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.workoutCardStatText}>{Math.round(workout.totalVolume).toLocaleString()} kg</Text>
                </View>
                <View style={styles.workoutCardStat}>
                  <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.workoutCardStatText}>{workout.totalSets} {t('sets').toLowerCase()}</Text>
                </View>
                {workout.prCount > 0 && (
                  <View style={styles.workoutCardStat}>
                    <Ionicons name="trophy" size={14} color={colors.accent} />
                    <Text style={[styles.workoutCardStatText, { color: colors.accent }]}>{workout.prCount} PR</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  appName: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  streakWrapper: { marginBottom: 20 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 10, marginRight: 10, alignItems: 'center' },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  sectionCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, marginBottom: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  sectionTitleLarge: { color: colors.textPrimary, fontSize: 19, fontWeight: '800' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  activityCol: { alignItems: 'center', width: 32 },
  activityBarTrack: { height: 58, justifyContent: 'flex-end' },
  activityBar: { width: 18, borderRadius: 9 },
  activityLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 8 },
  activityLabelToday: { color: colors.accent, fontWeight: '800' },
  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  prIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,210,211,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  prExerciseName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  prDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  prDate: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  quickActionsRow: { marginBottom: 24 },
  primaryAction: { flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  primaryActionText: { color: colors.background, fontWeight: '800', fontSize: 16, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  workoutCard: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12 },
  workoutCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workoutCardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  workoutCardDate: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  workoutCardMuscles: { color: colors.accent, fontSize: 12, fontWeight: '600', marginTop: 4 },
  workoutCardStatsRow: { flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' },
  workoutCardStat: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginTop: 4 },
  workoutCardStatText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginLeft: 4 },
});