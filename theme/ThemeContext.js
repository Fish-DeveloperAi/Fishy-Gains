import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEMES = {
  ocean: {
    id: 'ocean',
    name: 'Ocean (Default)',
    background: '#0B1D3A',
    card: '#12274D',
    cardAlt: '#162C54',
    accent: '#00D2D3',
    textPrimary: '#FFFFFF',
    textSecondary: '#7C8DAF',
    danger: '#FF5C5C',
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    background: '#FAFAFA',
    card: '#FFFFFF',
    cardAlt: '#F3E8EE',
    accent: '#FFB7B2',
    textPrimary: '#2D3748',
    textSecondary: '#A0AEC0',
    danger: '#FC8181',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    background: '#09090B',
    card: '#15151A',
    cardAlt: '#1F1F2E',
    accent: '#00FFCC',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B949E',
    danger: '#FF007C',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    background: '#0B140F',
    card: '#13241A',
    cardAlt: '#1A3324',
    accent: '#2ECC71',
    textPrimary: '#F1F8F5',
    textSecondary: '#8CA595',
    danger: '#E74C3C',
  },
  inferno: {
    id: 'inferno',
    name: 'Inferno',
    background: '#120505',
    card: '#1C0A0A',
    cardAlt: '#2A1010',
    accent: '#FF4500',
    textPrimary: '#FFFFFF',
    textSecondary: '#A88B8B',
    danger: '#FF0000',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    background: '#000000',
    card: '#121212',
    cardAlt: '#1E1E1E',
    accent: '#3B82F6',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    danger: '#EF4444',
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    background: '#080A17',
    card: '#11142E',
    cardAlt: '#1A1E40',
    accent: '#9D4EDD', 
    textPrimary: '#FFFFFF',
    textSecondary: '#7985B4',
    danger: '#F72585',
  },

  iosLight: {
  id: 'iosLight',
  name: 'iOS Light',
  background: '#F2F2F7',   
  card: '#FFFFFF',         
  cardAlt: '#E5E5EA',      
  accent: '#007AFF',       
  textPrimary: '#000000',
  textSecondary: '#8E8E93', 
  danger: '#FF3B30',       
  },
  iosDark: {
    id: 'iosDark',
    name: 'iOS Dark',
    background: '#000000',   
    card: '#1C1C1E',         
    cardAlt: '#2C2C2E',      
    accent: '#0A84FF',       
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93', 
    danger: '#FF453A',       
  },
  neon: {
  id: 'neon',
  name: '⚡ Neon',
  background: '#0A0014',
  card: '#160726',
  cardAlt: '#230D3D',
  accent: '#FF00E5',        // hot magenta glow
  textPrimary: '#FFFFFF',
  textSecondary: '#B084F5', // soft violet-gray
  danger: '#FF2965',
},
book: {
  id: 'book',
  name: '📖 Book',
  background: '#EFE6D5',    // aged paper
  card: '#F7F0E1',
  cardAlt: '#E3D5B8',
  accent: '#8B5E34',        // leather brown
  textPrimary: '#2B2117',   // ink black-brown
  textSecondary: '#7A6A54', // faded sepia
  danger: '#A6402C',
},
blossom: {
  id: 'blossom',
  name: '🌸 Blossom',
  background: '#1A1023',    // deep plum night
  card: '#2A1734',
  cardAlt: '#3A2246',
  accent: '#FF8FB1',        // sakura pink
  textPrimary: '#FFF3F7',
  textSecondary: '#C9A0C4',
  danger: '#FF5C7A',
},
celestialDragon: {
  id: 'celestialDragon',
  name: '🐉 Celestial Dragon',
  background: '#050B14',    // void black-blue
  card: '#0D1826',
  cardAlt: '#152738',
  accent: '#FFD166',        // gold scale shimmer
  textPrimary: '#F4F9FF',
  textSecondary: '#7FA8C9',
  danger: '#EF476F',
},

};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState('ocean');

  //saves the user's choice after closing the app 
  
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme && THEMES[savedTheme]) setActiveTheme(savedTheme);
    };
    loadTheme();
  }, []);

  const changeTheme = async (themeId) => {
    setActiveTheme(themeId);
    await AsyncStorage.setItem('userTheme', themeId);
  };
  

  const colors = THEMES[activeTheme];

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      activeTheme, 
      setActiveTheme:changeTheme,
      THEMES 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);