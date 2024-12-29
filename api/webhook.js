import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Temporary in-memory storage for referral data
let referralStorage = {}; // Structure: { telegramId: referrerId }

bot.start(async (ctx) => {
    const telegramId = ctx.from.id; // Get the user's Telegram ID
    const args = ctx.message.text.split(" "); // Extract the referral argument

    let referrerId = null;

    if (args.length > 1) {
        referrerId = args[1]; // Extract the referrerId
        referralStorage[telegramId] = referrerId; // Store it temporarily
        console.log(`User ${telegramId} was referred by ${referrerId}`);

        ctx.reply(`Welcome! You were referred by user ${referrerId}. Please sign up to get started.`);
    } else {
        ctx.reply("Welcome! Start using the app soon to begin.");
    }
});


// Webhook handler
export default async (req, res) => {
    if (req.method === "POST") {
        try {
            // Handle the webhook update
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