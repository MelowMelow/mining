import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const handler = async (req, res) => {
    console.log("Received authentication request");

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { initData } = req.body;

        // Validate incoming data
        if (!initData) {
            return res.status(400).json({ error: "No Telegram init data provided" });
        }

        const params = new URLSearchParams(initData);
        const userData = Object.fromEntries(params.entries());
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!TELEGRAM_BOT_TOKEN) {
            console.error("Telegram Bot Token is not set");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Parse Telegram user data
        const user = JSON.parse(userData.user || "{}");
        const { id, username, first_name, last_name, photo_url, language_code } = user;

        if (!id) {
            return res.status(400).json({ error: "Invalid user data" });
        }

        // Verify Telegram data integrity
        const dataCheckString = Object.entries(userData)
            .filter(([key]) => key !== "hash")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        const secretKey = crypto
            .createHmac("sha256", "WebAppData")
            .update(TELEGRAM_BOT_TOKEN)
            .digest();

        const calculatedHash = crypto
            .createHmac("sha256", secretKey)
            .update(dataCheckString)
            .digest("hex");

        if (calculatedHash !== userData.hash) {
            return res.status(403).json({ error: "Invalid signature" });
        }

        // Query the database for an existing user and their resources
        const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select(`
                *,
                resources (
                    gold,
                    silver,
                    iron
                )
            `)
            .eq("telegram_id", id)
            .single();

        if (userError && userError.code !== "PGRST116") {
            console.error("Database user fetch error:", userError.message);
            return res.status(500).json({ error: userError.message });
        }

        // Handle existing user scenario
        if (existingUser) {
            console.log(`User with Telegram ID ${id} found.`, existingUser);

            return res.status(200).json({
                success: true,
                user: existingUser,
                telegram_id: id,
                resources: existingUser.resources || { gold: 0, silver: 0, iron: 0 },
                isNewUser: false,
            });
			
        }

        // Register new user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{
                telegram_id: id,
                username: username || null,
                first_name: first_name || null,
                last_name: last_name || null,
                photo_url: photo_url || null,
                language_code: language_code || null,
            }])
            .select()
            .single();

        if (insertError) {
            console.error("User creation error:", insertError.message);
            return res.status(500).json({ error: insertError.message });
        }

        // Initialize default resources for the new user
        const { data: resourceSetup, error: resourceError } = await supabase
            .from("resources")
            .insert([{
                user_id: newUser.id,
                gold: 0,
                silver: 0,
                iron: 0,
            }])
            .select()
            .single();

        if (resourceError) {
            console.error("Resource creation error:", resourceError.message);
            return res.status(500).json({ error: resourceError.message });
        }

        console.log(`New user created with Telegram ID ${id}. Resources initialized.`);

        return res.status(200).json({
            success: true,
            user: newUser,
            telegram_id: id,
            resources: resourceSetup,
            isNewUser: true,
        });
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
    }
};

export default handler;
