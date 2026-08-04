import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

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
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
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
      ]).start();
    }
  }, [visible, achievement]);

  if (!achievement && !visible) return null;

  //  Determine the color dynamically (fallback to the theme accent just in case)
  const rarityColor = achievement?.rarity ? RARITY_COLORS[achievement.rarity] : colors.accent;

  return (
    <Modal transparent visible={visible || fadeAnim > 0} animationType="none">
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
            <Text style={styles.iconText}>{achievement?.icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.unlockedText}>Achievement Unlocked!</Text>
            {/*  Color coordinate the title text */}
            <Text style={[styles.titleText, { color: rarityColor }]}>
              {achievement?.title}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {achievement?.description}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: rarityColor }]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Awesome</Text>
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