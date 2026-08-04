// constants/ranks.js
// Shared Ocean Rank ladder.
//
// Previously OceanRankCard.js and database/db.js each defined their own rank
// thresholds ("Shark" at 400 kg on the card, at 300 kg in the achievement
// stats), so the "Apex Predator" / "Leviathan" achievements unlocked at a
// total the user never actually saw on screen. Both now read this list.
export const OCEAN_RANKS = [
  { rank: 'Shrimp', min: 0, icon: '🦐' },
  { rank: 'Sardine', min: 100, icon: '🐟' },
  { rank: 'Mackerel', min: 200, icon: '🐠' },
  { rank: 'Tuna', min: 300, icon: '🐡' },
  { rank: 'Shark', min: 400, icon: '🦈' },
  { rank: 'Dolphin', min: 500, icon: '🐬' },
  { rank: 'Orca', min: 600, icon: '🐳' },
  { rank: 'Sperm Whale', min: 700, icon: '🐋' },
  { rank: 'Leviathan', min: 800, icon: '👑' },
];

// Returns the rank object matching a Big Three total.
export function getRankForTotal(total = 0) {
  let current = OCEAN_RANKS[0];
  for (let i = 0; i < OCEAN_RANKS.length; i += 1) {
    if (total >= OCEAN_RANKS[i].min) current = OCEAN_RANKS[i];
    else break;
  }
  return current;
}

// Index of a rank name in the ladder (-1 when unknown).
export function getRankIndex(rankName) {
  return OCEAN_RANKS.findIndex((r) => r.rank === rankName);
}
