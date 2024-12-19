import { createClient } from "@supabase/supabase-js"; 
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resourceType, id } = req.body;
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Ensure the correct user is making the request
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Compare user ID in request with ID in localStorage
  if (storedUserId !== id) {
    console.error("User ID mismatch. Authentication failed.");
    return res.status(403).json({ error: "Unauthorized request" });
  }

  if (!["gold", "silver", "copper"].includes(resourceType)) {
    return res.status(400).json({ error: "Invalid resource type" });
  }

  console.log("Received request to update resource:", { id, resourceType });

  try {
    // Update the resource count directly in the resources table based on user_id
    const { data, error } = await supabase
      .from("resources")
      .upsert([
        {
          user_id: id,
          [resourceType]: supabase.raw(`${resourceType} + 1`), // Increment resource count
        },
      ])
      .select();

    if (error) {
      console.error("Error updating resources:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error handling resource update:", error);
    return res.status(500).json({ error: error.message });
  }
}
