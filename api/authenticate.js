import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request at /api/authenticate", req.body);  // Log the body of the request

    // Ensure data is valid
    if (!req.body.hash) {
        console.log("No hash provided, authentication failed");
        return res.status(400).json({ error: "Hash missing or invalid." });
    }

    console.log('Request Method:', req.method);  // Log the request method
    console.log('Incoming Body:', req.body);  // Logs the incoming data for debugging

    if (req.method !== "POST") {
        console.log('Method not allowed');
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { hash, ...authData } = req.body;
        console.log('authData:', authData);  // Log the data sent from the Telegram Widget

        // Check if required fields (user's ID, username) are present
        if (!authData.id || !authData.username) {
            console.log("Missing required fields:", authData);  // Log missing fields
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

        console.log("Validation hash:", validationHash, "Received hash:", hash);  // Log hashes for comparison

        if (validationHash !== hash) {
            console.log("Hash mismatch");
            return res.status(400).json({ error: "Invalid hash. Data verification failed." });
        }

        // After hash validation, save the data to Supabase
        const { data, error } = await supabase
            .from("users")
            .upsert(
                [{
                    telegram_id: authData.id,
                    username: authData.username,
                    first_name: authData.first_name || null,
                    last_name: authData.last_name || null,
                }],
                { onConflict: ["telegram_id"] } // Ensures no duplicate telegram_id entries
            );

        if (error) {
            console.log("Error inserting data into Supabase:", error);  // Log any Supabase errors
            throw error;
        }

        console.log('User registered successfully:', data); // Log success

        return res.status(200).json({ success: true, user: data });
    } catch (error) {
        console.error("Server error:", error.message);  // Log any server-side errors
        return res.status(500).json({ error: error.message });
    }
}
