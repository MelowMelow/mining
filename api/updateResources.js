import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Ensure that only POST requests are allowed
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract data from the request body
    const { telegramId, resourceType, amount } = req.body;

    // Validate incoming data
    if (!telegramId || !["gold", "silver", "copper"].includes(resourceType) || !amount) {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        // Perform the update using a Supabase stored procedure (assuming you have a function called 'increment_resource')
        const { data, error } = await supabase.rpc("increment_resource", {
            user_id: telegramId, // Using telegramId as user_id in your resources table
            resource: resourceType,
            increment: amount,
        });

        // Handle any errors returned by Supabase's stored procedure
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Return the result of the update
        return res.status(200).json({ success: true, data });
    } catch (error) {
        // Handle any unexpected errors that occur during the execution of the function
        return res.status(500).json({ error: "Error updating resources" });
    }
}
export default handler;