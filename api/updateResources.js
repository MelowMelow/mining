import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== "POST") {
        return res.status(405).json({ 
            success: false, 
            error: "Method not allowed" 
        });
    }

    const { telegramId, resourceType, amount } = req.body;

    // Validate input
    if (!telegramId) {
        return res.status(400).json({ 
            success: false, 
            error: "Missing telegramId" 
        });
    }

    if (!["gold", "silver", "copper"].includes(resourceType)) {
        return res.status(400).json({ 
            success: false, 
            error: "Invalid resource type" 
        });
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            error: "Invalid amount" 
        });
    }

    try {
        console.log('Calling increment_resource with:', {
            user_id: telegramId,
            resource: resourceType,
            increment: amount
        });

        const { data, error } = await supabase.rpc("increment_resource", {
            user_id: telegramId,
            resource: resourceType,
            increment: amount
        });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal server error" 
        });
    }
}