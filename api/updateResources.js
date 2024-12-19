import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resourceType, id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!["gold", "silver", "copper"].includes(resourceType)) {
    return res.status(400).json({ error: "Invalid resource type" });
  }

  console.log("Received request to update resource:", { id, resourceType });

  try {
    // Call the increment_resource function directly via RPC
    const { data, error } = await supabase.rpc("increment_resource", {
      user_id: id,  // Pass user_id (integer)
      resource: resourceType,  // Pass resource type (string)
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