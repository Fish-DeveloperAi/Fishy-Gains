import React, { useEffect, useRef, useState } from 'react';
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

import { finishWorkout, getWorkoutDetail } from '../database/db';
import ShareableWorkoutCard from '../components/ShareableWorkoutCard';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

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
  const { workoutId, durationSeconds } = route.params;
  const [workout, setWorkout] = useState(null);
  const [notes, setNotes] = useState('');
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    finishWorkout(workoutId, durationSeconds, '');
    const detail = getWorkoutDetail(workoutId);
    setWorkout(detail);
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
            <Ionicons name="checkmark-circle" size={56} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>Workout Complete!</Text>
          <Text style={styles.subtitle}>{workout.name}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="barbell-outline" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{Math.round(workout.totalVolume).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Volume (lb)</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="layers-outline" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{workout.totalSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame-outline" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statLabel}>Est. Calories</Text>
            </View>
          </View>

          {workout.prCount > 0 && (
            <View style={styles.prBanner}>
              <Ionicons name="trophy" size={20} color="#0B1D3A" />
              <Text style={styles.prBannerText}>
                {workout.prCount} Personal Record{workout.prCount > 1 ? 's' : ''} today!
              </Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>NOTES</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How did it feel? Anything to remember for next time..."
            placeholderTextColor={COLORS.textSecondary}
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
                {ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0).toLocaleString()} lb volume
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
            <Ionicons name="share-social-outline" size={20} color={COLORS.accent} />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40, alignItems: 'stretch' },
  successIconWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 8 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  prBannerText: { color: '#0B1D3A', fontWeight: '800', fontSize: 14, marginLeft: 8 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exerciseSummaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  exerciseSummaryName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  exerciseSummaryMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  hiddenCardWrap: { position: 'absolute', top: -10000, left: -10000 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
  },
  shareButtonText: { color: COLORS.accent, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  doneButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: { color: '#0B1D3A', fontWeight: '800', fontSize: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});