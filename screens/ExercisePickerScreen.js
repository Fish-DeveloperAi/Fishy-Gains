import React, { useCallback, useMemo, useState, useEffect, memo } from 'react';
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
import { Image } from 'expo-image';

import { getExercises, getMuscleGroups, addExerciseToRoutine } from '../database/db';
import { useTheme } from '../theme/ThemeContext';

const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// 1. MEMOIZED ROW COMPONENT
const ExerciseRow = memo(({ item, selected, colors, styles, onToggle }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const primaryMuscle = item.muscle_group || (item.primaryMuscles ? item.primaryMuscles[0] : 'Other');
  const equipment = item.equipment || item.category || 'None';
  const metaText = `${capitalize(primaryMuscle)} · ${capitalize(equipment)}`;
  
  // Safely encode the URL to handle spaces and special characters
  const rawUrl = item.image ? `${IMAGE_BASE_URL}${item.image}` : null;
  const imageUrl = rawUrl ? encodeURI(rawUrl) : null;

  // FlatList recycles components. We must reset the error state when the item changes!
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <TouchableOpacity
      style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="disk"
            transition={300} // Adds a smooth 300ms fade-in
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Ionicons name="barbell" size={24} color={colors.accent} />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseMeta}>{metaText}</Text>
      </View>
      
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={selected ? colors.accent : colors.cardAlt}
      />
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.selected === nextProps.selected && prevProps.colors === nextProps.colors;
});

export default function ExercisePickerScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { routineId, returnScreen } = route.params || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // 2. SEARCH DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadExercises = useCallback(() => {
    setExercises(getExercises(debouncedSearch, selectedMuscle));
    setMuscleGroups(['All', ...getMuscleGroups()]);
  }, [debouncedSearch, selectedMuscle]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const filters = useMemo(() => muscleGroups, [muscleGroups]);

  // 3. CALLBACK REFERENCE
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    
    if (routineId) {
      selectedIds.forEach((id) => addExerciseToRoutine(routineId, id));
      navigation.goBack();
    } else if (returnScreen) {
      const allExercises = getExercises('', 'All');
      const finalChosen = selectedIds
        .map((id) => allExercises.find((e) => e.id === id))
        .filter(Boolean);
        
      navigation.navigate({
        name: returnScreen,
        params: { selectedExercises: finalChosen },
        merge: true, 
      });
    } else {
      navigation.goBack();
    }
  };

  // 4. MEMOIZED RENDER ITEM
  const renderItem = useCallback(({ item }) => (
    <ExerciseRow 
      item={item} 
      selected={selectedIds.includes(item.id)} 
      colors={colors} 
      styles={styles} 
      onToggle={toggleSelect} 
    />
  ), [selectedIds, colors, styles, toggleSelect]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textSecondary}
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
        renderItem={renderItem}
        // 5. LIST OPTIMIZATIONS
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No exercises found</Text>
          </View>
        }
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

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,141,175,0.15)',
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  filterList: { marginTop: 14, marginBottom: 6, flexGrow: 0, minHeight: 40 },
  filterChip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: colors.accent },
  filterChipText: { 
    color: colors.textSecondary, 
    fontSize: 13, 
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 18, 
  },
  filterChipTextActive: { color: colors.background, fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  exerciseRowSelected: { borderColor: colors.accent },
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
  },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '500' },
  newExerciseButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  newExerciseText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  confirmBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,141,175,0.15)',
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: { color: colors.background, fontWeight: '800', fontSize: 15 },
});