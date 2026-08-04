import React, { createContext, useState, useContext, useEffect } from 'react';
import AchievementModal from '../components/AchievementModal';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Accepts either a single achievement object or an array of objects
  const triggerAchievement = (achievements) => {
    const incoming = Array.isArray(achievements) ? achievements : [achievements];
    setQueue((prevQueue) => [...prevQueue, ...incoming]);
  };

  // Watch the queue. If there's an achievement waiting, the modal is hidden, 
  // and we aren't currently animating a close, show the next one.
  useEffect(() => {
    if (queue.length > 0 && !modalVisible && !isAnimating) {
      // 1. Lock the queue so it doesn't double-fire
      setIsAnimating(true);
      
      // 2. Set the current achievement to display
      setCurrentAchievement(queue[0]);
      
      // 3. Immediately remove it from the queue so we don't process it again
      setQueue((prevQueue) => prevQueue.slice(1));
      
      // 4. Show the modal
      setModalVisible(true);
    }
  }, [queue, modalVisible, isAnimating]);

  const handleClose = () => {
    // Hide the modal to trigger the exit animation
    setModalVisible(false);
    
    // Give the modal 350ms to finish its slide/fade-out animation 
    // before unlocking to process the next item in the queue.
    setTimeout(() => {
      setCurrentAchievement(null);
      setIsAnimating(false);
    }, 350);
  };

  return (
    <GamificationContext.Provider value={{ triggerAchievement }}>
      {children}
      <AchievementModal
        visible={modalVisible}
        achievement={currentAchievement}
        onClose={handleClose}
      />
    </GamificationContext.Provider>
  );
};