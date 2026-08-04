import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUnlockedAchievements } from '../database/db';
import { ACHIEVEMENTS_DATA } from '../constants/achievements';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2; // Accommodates padding

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t, hasTranslation } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [unlockedIds, setUnlockedIds] = useState([]);

  // Refresh the data every time the user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      const fetchedIds = getUnlockedAchievements();
      setUnlockedIds(fetchedIds);
    }, [])
  );

  const renderItem = ({ item }) => {
    const isUnlocked = unlockedIds.includes(item.id);
    // Achievement copy is localised via `<id>_title` / `<id>_desc` keys, with
    // the English text in constants/achievements.js as the fallback.
    const titleKey = `${item.id}_title`;
    const descKey = `${item.id}_desc`;
    const title = hasTranslation(titleKey) ? t(titleKey) : item.title;
    const description = hasTranslation(descKey) ? t(descKey) : item.description;

    return (
      <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, !isUnlocked && styles.iconLocked]}>
            {item.icon}
          </Text>
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={28} color={colors.background} />
            </View>
          )}
        </View>
        
        <Text style={[styles.title, !isUnlocked && styles.textLocked]} numberOfLines={1}>
          {title}
        </Text>
        
        <Text style={[styles.description, !isUnlocked && styles.textLocked]}>
          {isUnlocked ? description : t('keepTrainingToUnlock')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          {unlockedIds.length} / {ACHIEVEMENTS_DATA.length} {t('unlocked')}
        </Text>
      </View>

      <FlatList
        data={ACHIEVEMENTS_DATA}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#FDE047', 
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)', 
  },
  cardLocked: {
    backgroundColor: colors.background,
    borderColor: colors.card,
    opacity: 0.7,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
  },
  iconLocked: {
    opacity: 0.2,
  },
  lockOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  textLocked: {
    color: colors.textSecondary,
  },
});