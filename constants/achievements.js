export const ACHIEVEMENTS_DATA = [
  // -------------------------
  // WORKOUTS
  // -------------------------
  {
    id: 'first_splash',
    title: 'First Splash',
    icon: '💧', 
    description: 'Complete your first workout.',
    type: 'total_workouts',
    threshold: 1,
    rarity: 'common',
  },
  {
    id: 'hooked',
    title: 'Hooked',
    icon: '🎣',
    description: 'Complete 10 workouts.',
    type: 'total_workouts',
    threshold: 10,
    rarity: 'common',
  },
  {
    id: 'school_of_fish',
    title: 'School of Fish',
    icon: '🐟',
    description: 'Complete 50 workouts.',
    type: 'total_workouts',
    threshold: 50,
    rarity: 'uncommon',
  },
  {
    id: 'ocean_veteran',
    title: 'Ocean Veteran',
    icon: '🌊',
    description: 'Complete 100 workouts.',
    type: 'total_workouts',
    threshold: 100,
    rarity: 'rare',
  },

  // -------------------------
  // STREAKS & HABITS
  // -------------------------
  {
    id: 'unstoppable_current',
    title: 'Unstoppable Current',
    icon: '🔥',
    description: 'Maintain a 7-day workout streak.',
    type: 'daily_streak',
    threshold: 7,
    rarity: 'common',
  },
  {
    id: 'tidal_force',
    title: 'Tidal Force',
    icon: '🌀', 
    description: 'Maintain a 30-day workout streak.',
    type: 'daily_streak',
    threshold: 30,
    rarity: 'rare',
  },
  {
    id: 'consistency_pays',
    title: 'Consistency Pays',
    icon: '📅',
    description: 'Complete at least one workout for 8 consecutive weeks.',
    type: 'weekly_streak',
    threshold: 8,
    rarity: 'uncommon',
  },
  {
    id: 'dawn_surfer',
    title: 'Dawn Surfer',
    icon: '🌅',
    description: 'Complete a workout before 6:00 AM.',
    type: 'early_bird',
    threshold: 1,
    rarity: 'uncommon', 
  },

  // -------------------------
  // VOLUME & ENDURANCE
  // -------------------------
  {
    id: 'heavy_catch',
    title: 'Heavy Catch',
    icon: '⚓',
    description: 'Lift 10,000 kg in a single workout.',
    type: 'session_volume',
    threshold: 10000,
    rarity: 'uncommon',
  },
  {
    id: 'volume_monster',
    title: 'Volume Monster',
    icon: '🐳', 
    description: 'Lift 1,000,000 kg across all workouts.',
    type: 'lifetime_volume',
    threshold: 1000000,
    rarity: 'legendary',
  },
  {
    id: 'century_club',
    title: 'Century Club',
    icon: '💯',
    description: 'Complete 1,000 total sets.',
    type: 'lifetime_sets',
    threshold: 1000,
    rarity: 'rare',
  },
  {
    id: 'deep_sea_diver',
    title: 'Deep Sea Diver',
    icon: '🤿',
    description: 'Complete a single workout lasting over 2 hours.',
    type: 'duration',
    threshold: 120, 
    rarity: 'rare', 
  },

  // -------------------------
  // STRENGTH & MILESTONES
  // -------------------------
  {
    id: 'kraken_grip',
    title: 'Kraken Grip',
    icon: '🐙',
    description: 'Deadlift 200 kg.',
    type: 'max_deadlift',
    threshold: 200,
    rarity: 'epic',
  },
  {
    id: 'steel_fins',
    title: 'Steel Fins',
    icon: '🦀', 
    description: 'Squat 180 kg.',
    type: 'max_squat',
    threshold: 180,
    rarity: 'epic',
  },
  {
    id: 'chest_of_the_sea',
    title: 'Chest of the Sea',
    icon: '🐡', 
    description: 'Bench Press 100 kg.',
    type: 'max_bench',
    threshold: 100,
    rarity: 'rare',
  },
  {
    id: 'trident_master',
    title: 'Trident Master',
    icon: '🔱',
    description: 'Log a Squat, Bench Press, and Deadlift in a single workout.',
    type: 'combo_big_three',
    threshold: 1, 
    rarity: 'epic', // New!
  },

  // -------------------------
  // RANKS
  // -------------------------
  {
    id: 'apex_predator',
    title: 'Apex Predator',
    icon: '🦈', 
    description: 'Reach Shark Rank.',
    type: 'rank',
    threshold: 'Shark',
    rarity: 'epic',
  },
  {
    id: 'leviathan',
    title: 'Leviathan',
    icon: '👑',
    description: 'Reach the legendary Leviathan Rank.',
    type: 'rank',
    threshold: 'Leviathan',
    rarity: 'legendary',
  },
];