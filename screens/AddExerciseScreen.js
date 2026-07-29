import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { addCustomExercise } from '../database/db';

const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abs', 'other'];
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'cable', 'machine', 'body only', 'other'];

export default function AddExerciseScreen({ navigation }) {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('other');
  const [equipment, setEquipment] = useState('other');

  function handleSave() {
    if (!name.trim()) return;
    addCustomExercise(name.trim(), 'strength', equipment, muscle);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Exercise Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Cable Chest Fly"
      />

      <Text style={styles.label}>Primary Muscle</Text>
      <View style={styles.optionsRow}>
        {MUSCLE_OPTIONS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.option, muscle === m && styles.optionSelected]}
            onPress={() => setMuscle(m)}
          >
            <Text style={[styles.optionText, muscle === m && styles.optionTextSelected]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Equipment</Text>
      <View style={styles.optionsRow}>
        {EQUIPMENT_OPTIONS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.option, equipment === e && styles.optionSelected]}
            onPress={() => setEquipment(e)}
          >
            <Text style={[styles.optionText, equipment === e && styles.optionTextSelected]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#000' },
  optionText: { fontSize: 13, textTransform: 'capitalize', color: '#333' },
  optionTextSelected: { color: '#fff' },
  saveButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});