import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getExercises, getMuscleGroups, addExerciseToRoutine } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

export default function ExercisePickerScreen({ route, navigation }) {
  const { routineId, onSelect } = route.params || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadExercises = useCallback(() => {
    setExercises(getExercises(searchTerm, selectedMuscle));
    setMuscleGroups(['All', ...getMuscleGroups()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedMuscle]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const filters = useMemo(() => muscleGroups, [muscleGroups]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    if (routineId) {
      selectedIds.forEach((id) => addExerciseToRoutine(routineId, id));
    } else if (onSelect) {
      const allExercises = getExercises('', 'All');
      const finalChosen = selectedIds
        .map((id) => allExercises.find((e) => e.id === id))
        .filter(Boolean);
      onSelect(finalChosen);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor={COLORS.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedMuscle === item && styles.filterChipActive]}
            onPress={() => setSelectedMuscle(item)}
          >
            <Text style={[styles.filterChipText, selectedMuscle === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No exercises found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>{item.muscle_group} · {item.category}</Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={selected ? COLORS.accent : COLORS.textSecondary}
              />
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity style={styles.newExerciseButton} onPress={() => navigation.navigate('AddExercise')}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.accent} />
            <Text style={styles.newExerciseText}>Create Custom Exercise</Text>
          </TouchableOpacity>
        }
      />

      {selectedIds.length > 0 && (
        <View style={styles.confirmBar}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>
              Add {selectedIds.length} Exercise{selectedIds.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  filterList: { marginTop: 14, marginBottom: 6, flexGrow: 0 },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: COLORS.accent },
  filterChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600',includeFontPadding: false,
    textAlignVertical: 'center',lineHeight: 18, },
  filterChipTextActive: { color: '#0B1D3A', fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  exerciseRowSelected: { borderWidth: 1.5, borderColor: COLORS.accent },
  exerciseName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  newExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  newExerciseText: { color: COLORS.accent, fontWeight: '700', fontSize: 14, marginLeft: 6 },
  confirmBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,141,175,0.15)',
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#0B1D3A', fontWeight: '800', fontSize: 15 },
});