// screens/SettingsScreen.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext'; // Adjust path if needed

export default function SettingsScreen({ navigation }) {
  const { colors, activeTheme, THEMES } = useTheme();
  
  // Bring in the language context hook
  const { activeLanguage, changeLanguage, t } = useLanguage();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const LANGUAGES = [
    { id: 'en', name: 'English' },
    { id: 'ar', name: 'Arabic (العربية)' },
    { id: 'fr', name: 'French (Français)' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        {/* Translate Header */}
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Translate Section Label */}
        <Text style={styles.sectionLabel}>{t('preferences')}</Text>
        
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => navigation.navigate('ThemePickerScreen')} 
          activeOpacity={0.8}
        >
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: colors.cardAlt }]}>
              <Ionicons name="color-palette-outline" size={20} color={colors.accent} />
            </View>
            <View>
              {/* Translate Settings Name */}
              <Text style={styles.settingName}>{t('appearance')}</Text>
              <Text style={styles.settingSubtext}>
                {THEMES[activeTheme]?.name || t('selectTheme')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Translate Language Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('language')}</Text>
        
        <View style={styles.cardGroup}>
          {LANGUAGES.map((lang, index) => {
            const isActive = activeLanguage === lang.id;
            const isLast = index === LANGUAGES.length - 1;
            
            return (
              <TouchableOpacity 
                key={lang.id}
                style={[styles.languageRow, !isLast && styles.borderBottom]}
                // Trigger the real context update
                onPress={() => changeLanguage(lang.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.languageName, isActive && { color: colors.accent }]}>
                  {lang.name}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain completely unchanged
const createStyles = (COLORS) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(124,141,175,0.15)' },
  backButton: { padding: 4 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  settingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  settingName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  settingSubtext: { color: COLORS.textSecondary, fontSize: 13 },
  cardGroup: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden' },
  languageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(124,141,175,0.15)' },
  languageName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '500' },
});