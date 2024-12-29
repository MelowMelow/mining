import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Temporary storage for referral data (use a database in production)
const referrals = {}; // Example structure: { referrerId: [referredUserIds] }

bot.start((ctx) => {
    const telegramId = ctx.from.id; // Get the user's Telegram ID
    const args = ctx.message.text.split(" "); // Extract the command and arguments

    if (args.length > 1) {
        const referrerId = args[1]; // Extract the referral code (referrer ID)

        // Save referral information
        if (!referrals[referrerId]) {
            referrals[referrerId] = [];
        }
        referrals[referrerId].push(telegramId);

        console.log(`User ${telegramId} was referred by ${referrerId}`);
        ctx.reply(`Welcome! You were referred by user ${referrerId}. Start mining resources together at t.me/theminecryptobot/marsmine.`);
    } else {
        console.log(`User ${telegramId} started without a referral.`);
        ctx.reply("Welcome! You can now start interacting and mining resources together t.me/theminecryptobot/marsmine.");
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
