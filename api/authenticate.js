const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { hash, ...authData } = req.body;

    // Check if required fields are present
    if (!authData.id || !authData.username) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // Create validation string to verify Telegram login
    const checkString = Object.keys(authData)
        .sort()
        .map((key) => `${key}=${authData[key]}`)
        .join("\n");

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(TELEGRAM_BOT_TOKEN).digest();
    const validationHash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

    if (validationHash !== hash) {
        return res.status(400).json({ error: "Invalid hash. Data verification failed." });
    }

    // Verified, now register or update user in Supabase
    try {
        const { data, error } = await supabase
            .from("users")
            .upsert([{ 
                telegram_id: authData.id,
                username: authData.username,
                first_name: authData.first_name || null,
                last_name: authData.last_name || null,
            }], { onConflict: ['telegram_id'] }); // Ensures no duplicates based on telegram_id

        if (error) throw error;

        return res.status(200).json({ success: true, user: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
