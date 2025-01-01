import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // Add this import

const UpgradeMenu = () => {
  const [upgradeLevels, setUpgradeLevels] = useState([
    { level: 1, cost: { gold: 5, silver: 5, iron: 10 }, bonus: 10 },
    { level: 2, cost: { gold: 30, silver: 30, iron: 20, referralFriend: 1 }, bonus: 20 },
    // Add higher levels here, defining their costs and bonuses
  ]);
  const [playerData, setPlayerData] = useState({
    level: 1,
    resources: {
      gold: 0,
      silver: 0,
      iron: 0,
    },
    miningBonus: 0,
  });

  useEffect(() => {
    // Load player data from database (Supabase) on component mount
    const fetchData = async () => {
      // Replace with your Supabase client setup and table name
      const supabaseUrl = 'your-supabase-url'; // Replace with your Supabase URL
      const supabaseKey = 'your-supabase-key'; // Replace with your Supabase Key
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: player, error } = await supabase
        .from('resources') // Replace with your table name
        .select('*')
        .eq('telegram_id', localStorage.getItem('telegramId'));

      if (error) {
        console.error('Error fetching player data:', error);
        return;
      }
      setPlayerData({
        level: player ? player.level : 1,
        resources: {
          gold: player ? player.gold : 0,
          silver: player ? player.silver : 0,
          iron: player ? player.iron : 0,
        },
        miningBonus: player ? player.miningBonus : 0,
      });
    };
    fetchData();
  }, []);

  const handleUpgrade = async (level) => {
    // Check if player has enough resources
    if (
      playerData.resources.gold >= upgradeLevels[level - 1].cost.gold &&
      playerData.resources.silver >= upgradeLevels[level - 1].cost.silver &&
      playerData.resources.iron >= upgradeLevels[level - 1].cost.iron &&
      // ... (check for referral friend if required)
    ) {
      // Deduct resources from player
      // ... (update player resources in database)
      setPlayerData({
        ...playerData,
        resources: {
          gold: playerData.resources.gold - upgradeLevels[level - 1].cost.gold,
          silver: playerData.resources.silver - upgradeLevels[level - 1].cost.silver,
          iron: playerData.resources.iron - upgradeLevels[level - 1].cost.iron,
        },
      });

      // Update player's mining bonus
      const newMiningBonus = upgradeLevels[level - 1].bonus;
      setPlayerData({ ...playerData, miningBonus: newMiningBonus });

      // Update level in database
      // ... (update player level in database)
      setPlayerData({ ...playerData, level: level });
    } else {
      // Show error message for insufficient resources
      alert("Not enough resources to upgrade!");
    }
  };

  return (
    <div>
      <h2>Upgrade Mining Electric Thing</h2>
      <div>
        {upgradeLevels.map((level, index) => (
          <button
            key={index}
            onClick={() => handleUpgrade(level.level)}
            disabled={playerData.level < 2} // Disable upgrade if level is below 2
          >
            Level {level.level}: +{level.bonus}%
            <br />
            Cost: {level.cost.gold} Gold, {level.cost.silver} Silver, {level.cost.iron} Iron
          </button>
        ))}
      </div>
      <div>
        <h3>Current Level: {playerData.level}</h3>
        {playerData.level >= 2 && (
          <p>
            Mining Bonus: +{playerData.miningBonus}%
          </p>
        )}
      </div>
    </div>
  );
};

export default UpgradeMenu;