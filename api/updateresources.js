// updateresources.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }

  const { telegramId, resourceType, amount } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: "Telegram ID is required" });
  }

  if (!["gold", "silver", "iron"].includes(resourceType)) {
    return res.status(400).json({ error: "Invalid resource type" });
  }

  console.log("Received request to update resource:", { telegramId, resourceType, amount });

  try {
    // First get the user's data including exp and level
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, exp, level')
      .eq('telegram_id', telegramId)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate new exp and check for level up
    let newExp = (userData.exp || 0) + 1; // Add 1 XP per mining operation
    let newLevel = userData.level || 0;
    let expToNextLevel = 200 * Math.pow(2, newLevel); // 200, 400, 800, etc.

    // Check for level up
    while (newExp >= expToNextLevel) {
      newExp -= expToNextLevel;
      newLevel++;
      expToNextLevel = 200 * Math.pow(2, newLevel);
    }

    // Update both resources and user stats in a transaction
    const { data, error } = await supabase.rpc("update_resources_and_exp", {
      p_user_id: userData.id,
      p_resource: resourceType,
      p_exp: newExp,
      p_level: newLevel
    });

    if (error) {
      console.error("Error updating resources and exp:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Resource and exp updated successfully:", data);
    return res.status(200).json({ 
      success: true, 
      data,
      stats: {
        exp: newExp,
        level: newLevel,
        expToNextLevel
      },
      levelUp: newLevel > userData.level
    });
  } catch (error) {
    console.error("Error handling resource update:", error);
    return res.status(500).json({ error: error.message });
  }
}