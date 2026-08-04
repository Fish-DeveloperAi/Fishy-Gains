import React, { useState, useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];
const CATEGORIES = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Other'];

export default function AddExerciseScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [category, setCategory] = useState('Barbell');

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      Alert.alert(t('nameRequired'), t('enterExerciseName'));
      return;
    }
    // We save the English values to the DB for data consistency
    addCustomExercise(trimmed, muscleGroup, category);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>{t('exerciseName')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('egCableLateralRaise')}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>{t('muscleGroup')}</Text>
          <View style={styles.chipWrap}>
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                style={[styles.chip, muscleGroup === mg && styles.chipActive]}
                onPress={() => setMuscleGroup(mg)}
              >
                <Text style={[styles.chipText, muscleGroup === mg && styles.chipTextActive]}>
                  {t(mg === 'Full Body' ? 'fullBody' : mg.toLowerCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('equipment')}</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {t(cat.toLowerCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color={colors.background} />
            <Text style={styles.saveButtonText}>{t('saveExercise')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' ,includeFontPadding: false ,textAlignVertical: 'center'},
  chipTextActive: { color: colors.background, fontWeight: '800' },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: colors.background, fontWeight: '800', fontSize: 15, marginLeft: 8 },
});