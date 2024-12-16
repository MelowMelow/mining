const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// API Route Handler
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const authData = req.body;

    // Check if the necessary data is present
    if (!authData.username || !authData.id) {
        return res.status(400).json({ error: "Missing username or ID" });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // Generate the hash to verify the incoming data
    const hash = crypto
        .createHmac("sha256", TELEGRAM_BOT_TOKEN)
        .update(
            Object.keys(authData)
                .sort()
                .map((key) => authData[key])
                .join("\n")
        )
        .digest("hex");

    if (hash !== authData.hash) {
        return res.status(400).send("Hash mismatch. Invalid data.");
    }

    // Now the data is valid, proceed with user registration or update
    const { id, username, first_name, last_name } = authData;

    try {
        const { data, error } = await supabase
            .from("users")
            .upsert([{ telegram_id: id, username, first_name, last_name }]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ success: true, user: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
