// webhook.js
import { Telegraf } from "telegraf";
import { createClient } from "@supabase/supabase-js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const args = ctx.message.text.split(" ");
    
    if (args.length > 1) {
        const referrerId = args[1];
        
        // Store referral data in Supabase
        const { error } = await supabase
            .from('pending_referrals')  // You'll need to create this table
            .upsert({ 
                telegram_id: telegramId,
                referrer_id: referrerId,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error storing referral:', error);
        }

        console.log(`User ${telegramId} was referred by ${referrerId}`);
        ctx.reply(`Welcome! You were referred by user ${referrerId}. You could launch app now t.me/theminecryptobot/marsmine');
    } else {
        ctx.reply("Welcome! Start using the app t.me/theminecryptobot/marsmine");
    }
});

export default async (req, res) => {
    if (req.method === "POST") {
        try {
            const update = req.body;
            await bot.handleUpdate(update);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error("Error handling webhook:", error);
            res.status(500).json({ ok: false, error: error.message });
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
};