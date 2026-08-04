import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// each rarity has a color now!!!!!
const RARITY_COLORS = {
  common: '#2ECC71',     
  uncommon: '#3498DB',   
  rare: '#9B59B6',       
  epic: '#E67E22',       
  legendary: '#F1C40F',  
};

export default function AchievementModal({ visible, achievement, onClose }) {
  const { colors } = useTheme();
  const { t, hasTranslation } = useLanguage();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // The native Modal must stay mounted while the exit animation plays.
  // `fadeAnim > 0` never worked: fadeAnim is an Animated.Value, so the
  // comparison is always false and the modal popped out instantly.
  const [isMounted, setIsMounted] = useState(false);
  // Keep the last achievement around so the exit animation isn't blank when
  // the queue clears it.
  const [displayed, setDisplayed] = useState(achievement);

  useEffect(() => {
    if (achievement) setDisplayed(achievement);
  }, [achievement]);

  useEffect(() => {
    if (visible && achievement) {
      setIsMounted(true);
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 50, // Distance from top of screen
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Slide up and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
  }, [visible, achievement, fadeAnim, slideAnim]);

  if (!isMounted && !visible) return null;

  const current = achievement || displayed;

  //  Determine the color dynamically (fallback to the theme accent just in case)
  const rarityColor = current?.rarity ? RARITY_COLORS[current.rarity] || colors.accent : colors.accent;

  // Dynamically generate translation keys based on the achievement ID.
  // `t` returns the key itself when nothing matches, so we check first and fall
  // back to the English copy baked into the achievement definition.
  const titleKey = current ? `${current.id}_title` : '';
  const descKey = current ? `${current.id}_desc` : '';
  const localizedTitle = current
    ? hasTranslation(titleKey) ? t(titleKey) : current.title
    : '';
  const localizedDesc = current
    ? hasTranslation(descKey) ? t(descKey) : current.description
    : '';

  return (
    <Modal transparent visible={visible || isMounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              //  Apply the dynamic color to the border and shadow
              borderColor: rarityColor,
              shadowColor: rarityColor,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${rarityColor}20` }]}>
            <Text style={styles.iconText}>{current?.icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.unlockedText}>{t('achievementUnlocked')}</Text>
            {/*  Color coordinate the title text */}
            <Text style={[styles.titleText, { color: rarityColor }]}>
              {localizedTitle}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {localizedDesc}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: rarityColor }]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{t('awesome')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)', // Dim the background slightly
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    // Dynamic Shadow properties (iOS) 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    // Dynamic Elevation (Android)
    elevation: 10, 
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  iconText: {
    fontSize: 36,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#888',
    marginBottom: 6,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF', 
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});