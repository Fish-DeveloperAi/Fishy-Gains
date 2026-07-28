import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { insertSet, getSetsForWorkoutExercise, estimate1RM, getBestSetForExercise } from '../database/db';
import RestTimer from '../components/RestTimer';

export default function LogWorkoutScreen({ route, navigation }) {
  const { exercise, workoutId } = route.params;
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [loggedSets, setLoggedSets] = useState([]);
  const [prMessage, setPrMessage] = useState(null);
  const [restKey, setRestKey] = useState(0); // Used to reset the timer

  useEffect(() => {
    refreshSets();
  }, []);

  function refreshSets() {
    setLoggedSets(getSetsForWorkoutExercise(workoutId, exercise.id));
  }

  function handleSave() {
    if (!weight || !reps) return;

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const currentEst1RM = estimate1RM(weightNum, repsNum);

    // 1. Check previous PR BEFORE inserting the new set
    const previousBest = getBestSetForExercise(exercise.id);
    const previousBest1RM = previousBest ? estimate1RM(previousBest.weight, previousBest.reps) : 0;

    // 2. Determine if this set beats the previous best 1RM
    const isNewPR = !previousBest || currentEst1RM > previousBest1RM;

    // 3. Save to database
    insertSet(workoutId, exercise.id, weightNum, repsNum);

    if (isNewPR) {
      setPrMessage(`New PR on ${exercise.name}! Est. 1RM: ${currentEst1RM}kg 🎉`);
    } else {
      setPrMessage(null);
    }

    setWeight('');
    setReps('');
    refreshSets();
    
    // 4. Force RestTimer to restart by incrementing key
    setRestKey((prev) => prev + 1);
  }

  return (
    <View style={styles.container}>
      {prMessage && (
        <View style={styles.prBanner}>
          <Text style={styles.prBannerText}>{prMessage}</Text>
        </View>
      )}

      <Text style={styles.exerciseName}>{exercise.name}</Text>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="0"
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
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>+ Log Set</Text>
      </TouchableOpacity>

      {/* Passing key={restKey} forces React to remount RestTimer and restart the countdown */}
      <RestTimer
        key={restKey}
        duration={90}
        active={restKey > 0}
        onFinish={() => setRestKey(0)}
      />

      <FlatList
        style={{ marginTop: 20 }}
        data={loggedSets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.setRow}>
            Set {index + 1}: {item.weight}kg × {item.reps} reps (est. 1RM: {estimate1RM(item.weight, item.reps)}kg)
          </Text>
        )}
      />

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate('ExercisePicker', { workoutId })}
      >
        <Text style={styles.doneButtonText}>+ Add Another Exercise</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  exerciseName: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1 },
  label: { fontSize: 13, color: '#777', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  setRow: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  doneButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  doneButtonText: { fontSize: 15, fontWeight: '600' },
  prBanner: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  prBannerText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
});