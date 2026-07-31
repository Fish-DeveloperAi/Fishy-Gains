import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { 
  insertSet, 
  getSetsForWorkoutExercise, 
  estimate1RM, 
  getBestSetForExercise, 
  getWorkoutSummary 
} from '../database/db';
import RestTimer from '../components/RestTimer';
import ShareableWorkoutCard from '../components/ShareableWorkoutCard';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function LogWorkoutScreen({ route, navigation }) {
  const { exercise, workoutId } = route.params;
  
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [loggedSets, setLoggedSets] = useState([]);
  const [prMessage, setPrMessage] = useState(null);
  const [restKey, setRestKey] = useState(0); 
  const [isFinished, setIsFinished] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => { refreshSets(); }, []);

  function refreshSets() {
    setLoggedSets(getSetsForWorkoutExercise(workoutId, exercise.id));
  }

  function handleSave() {
    if (!weight || !reps) return;

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const currentEst1RM = estimate1RM(weightNum, repsNum);

    const previousBest = getBestSetForExercise(exercise.id);
    const previousBest1RM = previousBest ? estimate1RM(previousBest.weight, previousBest.reps) : 0;
    const isNewPR = !previousBest || currentEst1RM > previousBest1RM;

    insertSet(workoutId, exercise.id, weightNum, repsNum);

    if (isNewPR) {
      setPrMessage(`New PR! Est. 1RM: ${currentEst1RM}kg 🏆`);
    } else {
      setPrMessage(null);
    }

    setWeight('');
    setReps('');
    refreshSets();
    setRestKey((prev) => prev + 1);
  }

  function handleFinishWorkout() {
    const stats = getWorkoutSummary(workoutId);
    setSummaryData({
      workoutTitle: stats.title,
      totalVolume: stats.totalVolumeKg.toLocaleString(),
      duration: 'N/A',
      exercisesCompleted: stats.exercisesCompleted,
      date: stats.date,
    });
    setIsFinished(true);
  }

  if (isFinished) {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryHeading}>Workout Complete!</Text>
        {summaryData && (
          <ShareableWorkoutCard
            workoutTitle={summaryData.workoutTitle}
            totalVolume={summaryData.totalVolume}
            duration={summaryData.duration}
            exercisesCompleted={summaryData.exercisesCompleted}
            date={summaryData.date}
          />
        )}
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {prMessage && (
        <View style={styles.prBanner}>
          <Text style={styles.prBannerText}>{prMessage}</Text>
        </View>
      )}

      <Text style={styles.exerciseName}>{exercise.name}</Text>

      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor={PALETTE.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              placeholderTextColor={PALETTE.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Log Set</Text>
        </TouchableOpacity>
      </View>

      <RestTimer key={restKey} duration={90} active={restKey > 0} onFinish={() => setRestKey(0)} />

      <FlatList
        style={styles.list}
        data={loggedSets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.setRow}>
            <Text style={styles.setNumber}>Set {index + 1}</Text>
            <Text style={styles.setStats}>{item.weight}kg × {item.reps}</Text>
            <Text style={styles.set1RM}>1RM: {estimate1RM(item.weight, item.reps)}kg</Text>
          </View>
        )}
      />

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('ExercisePicker', { workoutId })}>
          <Text style={styles.doneButtonText}>+ Add Another Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.finishWorkoutButton} onPress={handleFinishWorkout}>
          <Text style={styles.finishWorkoutButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  exerciseName: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: PALETTE.textMain, textAlign: 'center' },
  
  inputCard: { backgroundColor: PALETTE.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1 },
  label: { fontSize: 13, color: PALETTE.textMuted, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: PALETTE.border, borderRadius: 10, padding: 12, fontSize: 20, textAlign: 'center', backgroundColor: PALETTE.background, color: PALETTE.textMain, fontWeight: 'bold' },
  
  saveButton: { backgroundColor: PALETTE.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: '#0B1D3A', fontSize: 16, fontWeight: 'bold' },
  
  list: { marginTop: 10 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: PALETTE.surface, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: PALETTE.border },
  setNumber: { color: PALETTE.textMuted, fontWeight: 'bold', fontSize: 14 },
  setStats: { color: PALETTE.textMain, fontSize: 18, fontWeight: 'bold' },
  set1RM: { color: PALETTE.accent, fontSize: 12, fontWeight: '600' },
  
  prBanner: { backgroundColor: PALETTE.surface, padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: PALETTE.accent },
  prBannerText: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', color: PALETTE.accent },
  
  bottomButtonsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
  doneButton: { padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.border },
  doneButtonText: { fontSize: 15, fontWeight: '600', color: PALETTE.textMain },
  finishWorkoutButton: { padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: PALETTE.accent },
  finishWorkoutButtonText: { fontSize: 16, fontWeight: 'bold', color: '#0B1D3A' },
  
  summaryContainer: { flex: 1, backgroundColor: PALETTE.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  summaryHeading: { color: PALETTE.textMain, fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  homeButton: { marginTop: 30, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 999, backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.border },
  homeButtonText: { color: PALETTE.textMain, fontSize: 16, fontWeight: '600' }
});