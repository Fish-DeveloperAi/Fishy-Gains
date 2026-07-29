import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllRoutines, createRoutine, deleteRoutine } from '../database/db';

export default function RoutinesScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [newName, setNewName] = useState('');

  useFocusEffect(
    useCallback(() => {
      setRoutines(getAllRoutines());
    }, [])
  );

  function handleCreate() {
    if (!newName.trim()) return;
    const routineId = createRoutine(newName.trim());
    setNewName('');
    navigation.navigate('EditRoutine', { routineId, routineName: newName.trim() });
  }

  function handleDelete(id) {
    deleteRoutine(id);
    setRoutines(getAllRoutines());
  }

  return (
    <View style={styles.container}>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          placeholder="New routine name (e.g. Push Day)"
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routineCard}
            onPress={() => navigation.navigate('EditRoutine', { routineId: item.id, routineName: item.name })}
            onLongPress={() => handleDelete(item.id)}
          >
            <Text style={styles.routineName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No routines yet — create one above.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  createRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  createButton: { backgroundColor: '#000', borderRadius: 10, justifyContent: 'center', paddingHorizontal: 16 },
  createButtonText: { color: '#fff', fontWeight: '600' },
  routineCard: { backgroundColor: '#f7f7f7', padding: 16, borderRadius: 10, marginBottom: 10 },
  routineName: { fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 30 },
});