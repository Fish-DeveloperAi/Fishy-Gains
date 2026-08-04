import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { translateValue } from '../utils/i18nKeys';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${remMins}m`;
}

function formatDate(dateString, locale) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

const ShareableWorkoutCard = React.forwardRef(function ShareableWorkoutCard(
  { workoutName, date, durationSeconds, totalVolume, totalSets, exerciseCount, prCount, muscleGroups },
  ref
) {
  const { colors } = useTheme(); 
  const { t, locale } = useLanguage();
  const styles = getStyles(colors); 

  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="fish" size={22} color={colors.accent} />
          <Text style={styles.logoText}>FISHY GAINS</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(date, locale)}</Text>
      </View>

      <Text style={styles.workoutTitle} numberOfLines={2}>{workoutName}</Text>

      {muscleGroups && muscleGroups.length > 0 && (
        <View style={styles.tagRow}>
          {muscleGroups.slice(0, 4).map((mg) => (
            <View key={mg} style={styles.tag}>
              <Text style={styles.tagText}>{translateValue(mg, t)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color={colors.accent} />
          <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
          <Text style={styles.statLabel}>{t('duration')}</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="barbell-outline" size={20} color={colors.accent} />
          <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t('volumeKg')}</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="layers-outline" size={20} color={colors.accent} />
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>{t('sets')}</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="body-outline" size={20} color={colors.accent} />
          <Text style={styles.statValue}>{exerciseCount}</Text>
          <Text style={styles.statLabel}>{t('exercisesCount')}</Text>
        </View>
      </View>

      {prCount > 0 && (
        <View style={styles.prBanner}>
          <Ionicons name="trophy" size={18} color={colors.background} />
          <Text style={styles.prBannerText}>
            {prCount} {prCount > 1 ? t('personalRecords') : t('personalRecord')} {t('crushed')}
          </Text>
        </View>
      )}

      <Text style={styles.footerText}>{t('trackYourGains')}</Text>
    </View>
  );
});

export default ShareableWorkoutCard;

const getStyles = (colors) => StyleSheet.create({
  container: {
    width: 360,
    backgroundColor: colors.background,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardAlt, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.cardAlt,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
  },
  statBox: {
    width: '50%',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  prBannerText: {
    color: colors.background, 
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 18,
  },
});