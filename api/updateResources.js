import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with error checking
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Add CORS headers if needed
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

    // Enhanced validation with specific error messages
    if (!telegramId) {
        return res.status(400).json({ 
            success: false,
            error: "Missing telegramId" 
        });
    }
    
    if (!["gold", "silver", "copper"].includes(resourceType)) {
        return res.status(400).json({ 
            success: false,
            error: "Invalid resource type. Must be gold, silver, or copper" 
        });
    }
    
    if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ 
            success: false,
            error: "Invalid amount. Must be a number" 
        });
    }

    try {
        console.log(`Attempting to update resource for user ${telegramId}: ${amount} ${resourceType}`);

        // Call the Supabase stored procedure
        const { data, error } = await supabase.rpc("increment_resource", {
            user_id: telegramId,
            resource: resourceType,
            increment: amount,
        });

        // Log the response for debugging
        console.log('Supabase response:', { data, error });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false,
                error: error.message,
                details: error
            });
        }

        // Successful response
        return res.status(200).json({
            success: true,
            data,
            message: `Successfully updated ${resourceType} for user ${telegramId}`
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}