import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request:", req.method);  // This will print if the request is reaching the API

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { hash, ...authData } = req.body;

        console.log("Incoming data:", authData); // Print incoming data to verify

        // Check for required fields
        if (!authData.id || !authData.username) {
            console.log("Missing fields:", authData);
            return res.status(400).json({ error: "Missing required fields." });
        }

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        const checkString = Object.keys(authData)
            .sort()
            .map((key) => `${key}=${authData[key]}`)
            .join("\n");

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

        const { data, error } = await supabase
            .from("users")
            .upsert(
                [{
                    telegram_id: authData.id,
                    username: authData.username,
                    first_name: authData.first_name || null,
                    last_name: authData.last_name || null,
                }],
                { onConflict: ["telegram_id"] }
            );

        if (error) throw error;

        console.log("User registered successfully:", data);

        return res.status(200).json({ success: true, user: data });
    } catch (error) {
        console.error("Server error:", error.message);  // Log specific errors
        return res.status(500).json({ error: error.message });
    }
}
