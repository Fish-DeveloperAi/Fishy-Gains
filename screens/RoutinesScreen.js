import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllRoutines, createRoutine, deleteRoutine } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function RoutinesScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [newName, setNewName] = useState('');

  useFocusEffect(
    useCallback(() => { setRoutines(getAllRoutines()); }, [])
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
          placeholderTextColor={PALETTE.textMuted}
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
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  
  createRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  input: { flex: 1, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 12, padding: 14, backgroundColor: PALETTE.surface, color: PALETTE.textMain },
  
  createButton: { backgroundColor: PALETTE.accent, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 20 },
  createButtonText: { color: '#0B1D3A', fontWeight: 'bold' },
  
  routineCard: { backgroundColor: PALETTE.surface, padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: PALETTE.border },
  routineName: { fontSize: 18, fontWeight: 'bold', color: PALETTE.textMain },
  
  emptyText: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
});