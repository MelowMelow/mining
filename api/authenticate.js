const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { hash, ...authData } = req.body;

        console.log("Incoming data:", authData);

        // Check for required fields
        if (!authData.id || !authData.username) {
            console.log("Missing fields:", authData);
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Telegram Token for verification
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        // Prepare the data check string
        const checkString = Object.keys(authData)
            .sort()
            .map((key) => `${key}=${authData[key]}`)
            .join("\n");

        console.log("Check string:", checkString);

        // Hash for verification
        const secretKey = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
        const validationHash = crypto
            .createHmac("sha256", secretKey)
            .update(checkString)
            .digest("hex");

        console.log("Validation hash:", validationHash, "Received hash:", hash);

        if (validationHash !== hash) {
            console.log("Hash mismatch");
            return res.status(400).json({ error: "Invalid hash. Data verification failed." });
        }

        console.log("Hash verification successful!");

        // Verified data, upsert user into Supabase
        const { data, error } = await supabase
            .from("users")
            .upsert(
                [{
                    telegram_id: authData.id,
                    username: authData.username,
                    first_name: authData.first_name || null,
                    last_name: authData.last_name || null,
                }],
                { onConflict: ["telegram_id"] } // Ensures no duplicates
            );

        if (error) throw error;

        console.log("User registered successfully:", data);

        return res.status(200).json({ success: true, user: data });
    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
