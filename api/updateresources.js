// updateresources.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Define XP rewards for different resources
const XP_REWARDS = {
  gold: 5,    // 5 XP for gold
  silver: 3,  // 3 XP for silver
  iron: 1     // 1 XP for iron
};

export default async function handler(req, res) {
  // [Previous CORS and validation code remains the same]

  const { telegramId, resourceType, amount } = req.body;

  try {
    // Get user data [same as before]
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        resources (
          gold,
          silver,
          iron,
          exp,
          level
        )
      `)
      .eq('telegram_id', telegramId)
      .single();

    if (userError || !user) {
      console.error("Error finding user:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    const currentResources = user.resources[0] || {
      gold: 0,
      silver: 0,
      iron: 0,
      exp: 0,
      level: 0
    };

    // Calculate XP reward based on resource type
    const xpReward = XP_REWARDS[resourceType] || 1;
    let newExp = (currentResources.exp || 0) + xpReward;
    let newLevel = currentResources.level || 0;
    let expToNextLevel = 200 * Math.pow(2, newLevel);

    // Check for level up
    let leveledUp = false;
    while (newExp >= expToNextLevel) {
      newExp -= expToNextLevel;
      newLevel++;
      expToNextLevel = 200 * Math.pow(2, newLevel);
      leveledUp = true;
    }

    // [Rest of the code remains the same]
    const updateData = {
      ...currentResources,
      [resourceType]: (currentResources[resourceType] || 0) + amount,
      exp: newExp,
      level: newLevel
    };

    // Update resources
    const { data: updatedResources, error: updateError } = await supabase
      .from('resources')
      .update(updateData)
      .eq('user_id', user.id)
      .select();

    if (updateError) {
      console.error("Error updating resources:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      success: true,
      resources: updatedResources[0],
      stats: {
        exp: newExp,
        level: newLevel,
        expToNextLevel,
        xpGained: xpReward // Added to show how much XP was gained
      },
      levelUp: leveledUp
    });

  } catch (error) {
    console.error("Error handling resource update:", error);
    return res.status(500).json({ error: error.message });
  }
}