import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getAllExercises, searchExercises } from '../database/db';

export default function ExercisePickerScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    loadExercises();
  }, [search]);

  function loadExercises() {
    if (search.trim() === '') {
      setExercises(getAllExercises().slice(0, 100)); // cap initial list too
    } else {
      setExercises(searchExercises(search));
    }
  }

    function handleSelect(exercise) {
        navigation.navigate('LogWorkout', { exercise, workoutId: route.params.workoutId });
    }   

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search exercises..."
        value={search}
        onChangeText={setSearch}
      />
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
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumbnail: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  thumbnailPlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  rowText: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  subtext: { fontSize: 13, color: '#777', marginTop: 2, textTransform: 'capitalize' },
});