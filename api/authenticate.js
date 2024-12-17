import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import jwt from "jsonwebtoken";  // JWT for generating session tokens

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request at /api/authenticate", req.body);

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { hash, ...authData } = req.body;

    // Verify hash to ensure the data is coming from Telegram
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

    if (validationHash !== hash) {
        return res.status(400).json({ error: "Invalid hash." });
    }

    // Check if user already exists in the database
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", authData.id)
        .single();  // Fetch one user

    if (data) {
        console.log("User already exists:", data);
        // Create a session token
        const token = jwt.sign({ telegram_id: authData.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({ success: true, user: data, token });
    } else {
        // User does not exist, register them
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .upsert([
                {
                    telegram_id: authData.id,
                    username: authData.username,
                    first_name: authData.first_name || null,
                    last_name: authData.last_name || null,
                }
            ], { onConflict: ["telegram_id"] });

        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

        console.log("New user registered:", newUser);

        // Generate a session token for the new user
        const token = jwt.sign({ telegram_id: authData.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        return res.status(200).json({ success: true, user: newUser, token });
    }
}
