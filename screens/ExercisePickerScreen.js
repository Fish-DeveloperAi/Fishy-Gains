import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getAllExercises, searchExercises, addExerciseToRoutine } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function ExercisePickerScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);

  useEffect(() => { loadExercises(); }, [search]);

  function loadExercises() {
    if (search.trim() === '') {
      setExercises(getAllExercises().slice(0, 100));
    } else {
      setExercises(searchExercises(search));
    }
  }

  function handleSelect(exercise) {
    if (route.params?.routineId) {
      addExerciseToRoutine(route.params.routineId, exercise.id, Date.now());
      navigation.goBack();
    } else {
      navigation.navigate('LogWorkout', { exercise, workoutId: route.params.workoutId });
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search exercises..."
        placeholderTextColor={PALETTE.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      
      <TouchableOpacity style={styles.addCustomButton} onPress={() => navigation.navigate('AddExercise')}>
        <Text style={styles.addCustomButtonText}>+ Add Custom Exercise</Text>
      </TouchableOpacity>
      
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder} />
            )}
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtext}>{item.primary_muscle} · {item.equipment}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.background },
  searchBar: { margin: 16, padding: 14, borderRadius: 12, backgroundColor: PALETTE.surface, fontSize: 16, color: PALETTE.textMain, borderWidth: 1, borderColor: PALETTE.border },
  
  addCustomButton: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, backgroundColor: PALETTE.surface, alignItems: 'center', borderWidth: 1, borderColor: PALETTE.accent },
  addCustomButtonText: { fontSize: 14, fontWeight: 'bold', color: PALETTE.accent },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  thumbnail: { width: 50, height: 50, borderRadius: 8, backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.border },
  thumbnailPlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.border },
  
  rowText: { marginLeft: 16, flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: PALETTE.textMain },
  subtext: { fontSize: 13, color: PALETTE.textMuted, marginTop: 4, textTransform: 'capitalize' },
});