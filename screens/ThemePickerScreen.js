import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// The individual theme card component
const ThemeCard = ({ themeData, isSelected, onPress, colors }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: themeData.card, borderColor: isSelected ? themeData.accent : 'transparent' }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Mockup of UI elements inside the theme card */}
      <View style={styles.mockupContainer}>
        <View style={[styles.mockupBar, { backgroundColor: themeData.background, opacity: 0.5 }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View style={[styles.mockupDot, { backgroundColor: themeData.accent }]} />
          <View style={[styles.mockupLine, { borderColor: themeData.accent }]} />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={[styles.themeName, { color: themeData.textPrimary }]}>
          {themeData.name}
        </Text>
        <Ionicons 
          name={isSelected ? "radio-button-on" : "radio-button-off"} 
          size={20} 
          color={isSelected ? themeData.accent : colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );
};

export default function ThemePickerScreen({ navigation }) {
  const { colors, activeTheme, setActiveTheme, THEMES } = useTheme();
  const { t } = useLanguage();
  // Convert the THEMES object into an array so FlatList can render it
  const themesArray = Object.values(THEMES);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      
      {/* HEADER AREA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('appearance')}</Text>
      </View>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('pickTheme')}
      </Text>

      <FlatList
        data={themesArray}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <ThemeCard 
            themeData={item} 
            isSelected={activeTheme === item.id} 
            onPress={() => setActiveTheme(item.id)}
            colors={colors}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 40, // Extra padding at the bottom so the last row isn't cut off
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  mockupContainer: {
    marginBottom: 20,
  },
  mockupBar: {
    height: 8,
    width: '60%',
    borderRadius: 4,
  },
  mockupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  mockupLine: {
    flex: 1,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  },
});