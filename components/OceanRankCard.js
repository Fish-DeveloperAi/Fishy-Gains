import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBigThreeStats } from '../database/db';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// Shared with database/db.js so achievements unlock at the thresholds shown here.
import { OCEAN_RANKS } from '../constants/ranks';
import { translateValue } from '../utils/i18nKeys';

export default function OceanRankCard() {
  const { colors } = useTheme(); 
  const { t } = useLanguage();
  const styles = getStyles(colors); 
  
  const [stats, setStats] = useState({ squat: 0, bench: 0, deadlift: 0, total: 0 });

  useFocusEffect(
    useCallback(() => {
      setStats(getBigThreeStats());
    }, [])
  );

  let currentRank = OCEAN_RANKS[0];
  let nextRank = OCEAN_RANKS[1];

  for (let i = 0; i < OCEAN_RANKS.length; i++) {
    if (stats.total >= OCEAN_RANKS[i].min) {
      currentRank = OCEAN_RANKS[i];
      nextRank = OCEAN_RANKS[i + 1] || null; 
    } else {
      break;
    }
  }

  let progress = 100;
  if (nextRank) {
    const rankRange = nextRank.min - currentRank.min;
    const currentProgress = stats.total - currentRank.min;
    progress = (currentProgress / rankRange) * 100;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>{t('oceanRank')}</Text>
      
      <View style={styles.mainRankContainer}>
        <Text style={styles.rankIcon}>{currentRank.icon}</Text>
        <View style={styles.rankTextContainer}>
          <Text style={styles.rankName}>{translateValue(currentRank.rank, t)}</Text>
          <Text style={styles.totalWeight}>{stats.total} kg {t('total')}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>{t('current')}: {currentRank.min}kg</Text>
          {nextRank ? (
            <Text style={styles.progressLabelText}>{t('next')}: {nextRank.icon} {nextRank.min}kg</Text>
          ) : (
            <Text style={styles.progressLabelText}>{t('maxRankAchieved')}</Text>
          )}
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>{t('squat').toUpperCase()}</Text>
          <Text style={styles.breakdownValue}>{stats.squat} kg</Text>
        </View>
        <View style={[styles.breakdownItem, styles.breakdownBorder]}>
          <Text style={styles.breakdownLabel}>{t('bench').toUpperCase()}</Text>
          <Text style={styles.breakdownValue}>{stats.bench} kg</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>{t('deadlift').toUpperCase()}</Text>
          <Text style={styles.breakdownValue}>{stats.deadlift} kg</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardAlt,
  },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  mainRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rankIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  totalWeight: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.cardAlt,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.background, 
  },
  breakdownLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});