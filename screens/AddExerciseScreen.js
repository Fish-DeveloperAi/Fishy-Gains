import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { addCustomExercise } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

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
      <View style={styles.card}>
        <Text style={styles.label}>Exercise Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cable Chest Fly"
          placeholderTextColor={PALETTE.textMuted}
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
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  card: { backgroundColor: PALETTE.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border },
  
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: PALETTE.textMain, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: PALETTE.border, borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: PALETTE.background, color: PALETTE.textMain, marginBottom: 20 },
  
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  option: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: PALETTE.background, borderWidth: 1, borderColor: PALETTE.border },
  optionSelected: { backgroundColor: 'rgba(0, 210, 211, 0.1)', borderColor: PALETTE.accent },
  
  optionText: { fontSize: 13, textTransform: 'capitalize', color: PALETTE.textMuted, fontWeight: '600' },
  optionTextSelected: { color: PALETTE.accent, fontWeight: 'bold' },
  
  saveButton: { backgroundColor: PALETTE.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveButtonText: { color: '#0B1D3A', fontSize: 16, fontWeight: 'bold' },
});