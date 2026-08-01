import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getRoutines, createRoutine, deleteRoutine, duplicateRoutine } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

export default function RoutinesScreen({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

  const loadRoutines = useCallback(() => {
    setRoutines(getRoutines());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [loadRoutines])
  );

  const handleCreateRoutine = () => {
    const trimmed = newRoutineName.trim();
    if (trimmed.length === 0) return;
    const id = createRoutine(trimmed);
    setNewRoutineName('');
    setModalVisible(false);
    navigation.navigate('EditRoutine', { routineId: id });
  };

  const handleDuplicate = (id) => {
    duplicateRoutine(id);
    loadRoutines();
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Routine', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(id);
          loadRoutines();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={routines}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity style={styles.newRoutineButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={22} color={COLORS.accent} />
            <Text style={styles.newRoutineText}>Create New Routine</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No routines yet</Text>
            <Text style={styles.emptyStateSubtext}>Create one to start logging fast.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.routineCard}>
            <TouchableOpacity
              style={styles.routineCardMain}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('StartRoutine', { routineId: item.id })}
            >
              <Text style={styles.routineName}>{item.name}</Text>
              <Text style={styles.routineMeta}>
                {item.exerciseCount} exercise{item.exerciseCount !== 1 ? 's' : ''}
                {item.muscleGroups.length > 0 ? ` · ${item.muscleGroups.join(', ')}` : ''}
              </Text>
            </TouchableOpacity>
            <View style={styles.routineActions}>
              <TouchableOpacity
                style={styles.routineActionButton}
                onPress={() => navigation.navigate('EditRoutine', { routineId: item.id })}
              >
                <Ionicons name="pencil" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.routineActionButton} onPress={() => handleDuplicate(item.id)}>
                <Ionicons name="copy-outline" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.routineActionButton} onPress={() => handleDelete(item.id, item.name)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Routine</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Push Day"
              placeholderTextColor={COLORS.textSecondary}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateRoutine}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setNewRoutineName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateButton} onPress={handleCreateRoutine}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 20, paddingBottom: 40 },
  newRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
    borderStyle: 'dashed',
  },
  newRoutineText: { color: COLORS.accent, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptyStateSubtext: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  routineCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  routineCardMain: { flex: 1, padding: 16 },
  routineName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  routineMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4 },
  routineActions: { flexDirection: 'row' },
  routineActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  modalButtonRow: { flexDirection: 'row', marginTop: 18 },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    marginRight: 8,
  },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 15 },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  modalCreateText: { color: '#0B1D3A', fontWeight: '800', fontSize: 15 },
});