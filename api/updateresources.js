// updateResources.js (API route)
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
    return res.status(405).json({ error: "Method not allowed" });
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
    // First get the user's ID from telegram_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    // Call the increment_resource function with the user's ID
    const { data, error } = await supabase.rpc("increment_resource", {
      user_id: userData.id,
      resource: resourceType,
    });

    if (error) {
      console.error("Error updating resources:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Resource incremented successfully:", data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error handling resource update:", error);
    return res.status(500).json({ error: error.message });
  }
}