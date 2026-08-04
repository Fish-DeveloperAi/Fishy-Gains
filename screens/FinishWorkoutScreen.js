import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { 
  finishWorkout, 
  getWorkoutDetail, 
  getUserGamificationStats, 
  getUnlockedAchievements, 
  saveUnlockedAchievement 
} from '../database/db';
import ShareableWorkoutCard from '../components/ShareableWorkoutCard';
import { useTheme } from '../theme/ThemeContext';
import { useGamification } from '../context/GamificationContext';
import { evaluateAchievements } from '../utils/gamificationEngine';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function estimateCalories(durationSeconds, totalVolume) {
  const minutes = durationSeconds / 60;
  const base = minutes * 6.5;
  const volumeBonus = totalVolume * 0.005;
  return Math.round(base + volumeBonus);
}

export default function FinishWorkoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { triggerAchievement } = useGamification();

  const { workoutId, durationSeconds } = route.params;
  const [workout, setWorkout] = useState(null);
  const [notes, setNotes] = useState('');
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // 1. Finish the workout in the DB
    finishWorkout(workoutId, durationSeconds, '');
    const detail = getWorkoutDetail(workoutId);
    setWorkout(detail);

    // 2. Run Gamification Engine
    const currentStats = getUserGamificationStats(workoutId);
    const previouslyUnlockedIds = getUnlockedAchievements();
    const newlyUnlocked = evaluateAchievements(currentStats, previouslyUnlockedIds);

    // 3. Process new achievements
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(achievement => {
        saveUnlockedAchievement(achievement.id);
      });
      // Sends the entire array to the queue system in gamificationcontext 
      triggerAchievement(newlyUnlocked);
    }
  }, [workoutId, durationSeconds]);

  const handleSaveNotes = () => {
    finishWorkout(workoutId, durationSeconds, notes);
  };

  const handleDone = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
        setSharing(false);
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Your Workout' });
    } catch (e) {
      Alert.alert('Share Failed', 'Could not generate the shareable image.');
    } finally {
      setSharing(false);
    }
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading summary…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calories = estimateCalories(durationSeconds, workout.totalVolume);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
          </View>
          <Text style={styles.title}>Workout Complete!</Text>
          <Text style={styles.subtitle}>{workout.name}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="barbell-outline" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{Math.round(workout.totalVolume).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Volume (kg)</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="layers-outline" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{workout.totalSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame-outline" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statLabel}>Est. Calories</Text>
            </View>
          </View>

          {workout.prCount > 0 && (
            <View style={styles.prBanner}>
              <Ionicons name="trophy" size={20} color={colors.background} />
              <Text style={styles.prBannerText}>
                {workout.prCount} Personal Record{workout.prCount > 1 ? 's' : ''} today!
              </Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>NOTES</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How did it feel? Anything to remember for next time..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            onBlur={handleSaveNotes}
            multiline
          />

          <Text style={styles.sectionLabel}>EXERCISES</Text>
          {workout.exercises.map((ex) => (
            <View key={ex.exerciseId} style={styles.exerciseSummaryCard}>
              <Text style={styles.exerciseSummaryName}>{ex.exerciseName}</Text>
              <Text style={styles.exerciseSummaryMeta}>
                {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''} ·{' '}
                {ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0).toLocaleString()} kg volume
              </Text>
            </View>
          ))}

          <View style={styles.hiddenCardWrap} pointerEvents="none">
            <ShareableWorkoutCard
              ref={cardRef}
              workoutName={workout.name}
              date={workout.date}
              durationSeconds={durationSeconds}
              totalVolume={workout.totalVolume}
              totalSets={workout.totalSets}
              exerciseCount={workout.exerciseCount}
              prCount={workout.prCount}
              muscleGroups={workout.muscleGroups}
            />
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={sharing}>
            <Ionicons name="share-social-outline" size={20} color={colors.accent} />
            <Text style={styles.shareButtonText}>{sharing ? 'Preparing...' : 'Share Workout Card'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40, alignItems: 'stretch' },
  successIconWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 8 },
  statLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  prBannerText: { color: colors.background, fontWeight: '800', fontSize: 14, marginLeft: 8 },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exerciseSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  exerciseSummaryName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  exerciseSummaryMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  hiddenCardWrap: { position: 'absolute', top: -10000, left: -10000 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
  },
  shareButtonText: { color: colors.accent, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  doneButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: { color: colors.background, fontWeight: '800', fontSize: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});