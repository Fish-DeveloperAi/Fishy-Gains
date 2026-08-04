import React, { useCallback, useState, useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { translateValue } from '../utils/i18nKeys';

export default function RoutinesScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    Alert.alert(
      t('deleteRoutine'), 
      `${t('delete')} "${name}"? ${t('deleteRoutineWarning')}`, 
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            deleteRoutine(id);
            loadRoutines();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={routines}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity style={styles.newRoutineButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={22} color={colors.accent} />
            <Text style={styles.newRoutineText}>{t('createNewRoutine')}</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{t('noRoutinesYet')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('createOneToStart')}</Text>
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
                {item.exerciseCount} {item.exerciseCount !== 1 ? t('exercisesCount').toLowerCase() : t('exercise').toLowerCase()}
                {item.muscleGroups.length > 0 ? ` · ${item.muscleGroups.map(mg => translateValue(mg, t)).join(', ')}` : ''}
              </Text>
            </TouchableOpacity>
            <View style={styles.routineActions}>
              <TouchableOpacity
                style={styles.routineActionButton}
                onPress={() => navigation.navigate('EditRoutine', { routineId: item.id })}
              >
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.routineActionButton} onPress={() => handleDuplicate(item.id)}>
                <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.routineActionButton} onPress={() => handleDelete(item.id, item.name)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
            <Text style={styles.modalTitle}>{t('newRoutine')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('egPushDay')}
              placeholderTextColor={colors.textSecondary}
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
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateButton} onPress={handleCreateRoutine}>
                <Text style={styles.modalCreateText}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  newRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
    borderStyle: 'dashed',
  },
  newRoutineText: { color: colors.accent, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  routineCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  routineCardMain: { flex: 1, padding: 16 },
  routineName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  routineMeta: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4 },
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
    backgroundColor: colors.cardAlt,
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
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
  modalCancelText: { color: colors.textSecondary, fontWeight: '700', fontSize: 15 },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.accent,
    marginLeft: 8,
  },
  modalCreateText: { color: colors.background, fontWeight: '800', fontSize: 15 },
});