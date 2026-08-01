import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { addCustomExercise } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];
const CATEGORIES = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Other'];

export default function AddExerciseScreen({ navigation }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [category, setCategory] = useState('Barbell');

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      Alert.alert('Name Required', 'Please enter an exercise name.');
      return;
    }
    addCustomExercise(trimmed, muscleGroup, category);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>EXERCISE NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Cable Lateral Raise"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>MUSCLE GROUP</Text>
          <View style={styles.chipWrap}>
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                style={[styles.chip, muscleGroup === mg && styles.chipActive]}
                onPress={() => setMuscleGroup(mg)}
              >
                <Text style={[styles.chipText, muscleGroup === mg && styles.chipTextActive]}>{mg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>EQUIPMENT</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1D3A" />
            <Text style={styles.saveButtonText}>Save Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: COLORS.accent },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' ,includeFontPadding: false ,textAlignVertical: 'center'},
  chipTextActive: { color: '#0B1D3A', fontWeight: '800' },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#0B1D3A', fontWeight: '800', fontSize: 15, marginLeft: 8 },
});