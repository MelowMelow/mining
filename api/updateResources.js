import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Reusable function to update resources
async function updateResource(telegramId, resourceType, amount) {
    // Validate incoming data
    if (
        !telegramId ||
        !["gold", "silver", "iron"].includes(resourceType) ||
        typeof amount !== "number" ||
        amount <= 0
    ) {
        throw new Error("Invalid input data");
    }

    // Perform the update using a Supabase stored procedure
    const { data, error } = await supabase.rpc("increment_resource", {
        user_id: telegramId,
        resource: resourceType,
        increment: amount,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// API handler
const handler = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { telegramId, resourceType, amount } = req.body;

    try {
        const data = await updateResource(telegramId, resourceType, amount);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export default handler;
