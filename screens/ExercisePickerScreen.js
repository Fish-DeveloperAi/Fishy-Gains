import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
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

// Base URL for the free-exercise-db images
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Simplified component that relies exclusively on the database map
const ExerciseImage = ({ item }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [item.image]);

  let imageUrl = null;
  if (item.image) {
    // FIX: Removed the extra '/0.jpg' because item.image already contains it
    imageUrl = `${IMAGE_BASE_URL}${item.image}`;
  }

  if (!imageUrl || hasError) {
    return <Ionicons name="barbell" size={24} color={COLORS.accent} />;
  }

  return (
    <Image 
      source={{ uri: imageUrl }} 
      style={styles.thumbnail} 
      onError={() => setHasError(true)} 
    />
  );
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
          placeholder="Search exercises..."
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
          
          const primaryMuscle = item.muscle_group || (item.primaryMuscles ? item.primaryMuscles[0] : 'Other');
          const equipment = item.equipment || item.category || 'None';
          const metaText = `${capitalize(primaryMuscle)} · ${capitalize(equipment)}`;

          return (
            <TouchableOpacity
              style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnailContainer}>
                <ExerciseImage item={item} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>{metaText}</Text>
              </View>
              
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={selected ? COLORS.accent : COLORS.cardAlt}
              />
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity style={styles.newExerciseButton} onPress={() => navigation.navigate('AddExercise')}>
            <Text style={styles.newExerciseText}>+ Add Custom Exercise</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(124,141,175,0.15)',
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  filterList: { marginTop: 14, marginBottom: 6, flexGrow: 0, minHeight: 40 },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: COLORS.accent },
  filterChipText: { 
    color: COLORS.textSecondary, 
    fontSize: 13, 
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 18, 
  },
  filterChipTextActive: { color: '#0B1D3A', fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  exerciseRowSelected: { borderColor: COLORS.accent },
  thumbnailContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 210, 211, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exerciseName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '500' },
  newExerciseButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  newExerciseText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
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