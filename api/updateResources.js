import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { telegramId, resourceType, amount } = req.body;

    // Validate incoming data
    if (!telegramId || !["gold", "silver", "copper"].includes(resourceType) || !amount) {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        // Perform the update to the resources table using supabase
        const { data, error } = await supabase.rpc("increment_resource", {
            user_id: telegramId,  // Assuming telegramId is used as user_id in the database
            resource: resourceType,
            increment: amount,
        });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ error: "Error updating resources" });
    }
}
