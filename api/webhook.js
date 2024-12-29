import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Set up command handlers
bot.start((ctx) => {
    console.log("User started bot:", ctx.from.id);
    return ctx.reply("Welcome! You can now start interacting and mining resources together t.me/theminecryptobot/marsmine.");
});

export default async (req, res) => {
    if (req.method === "POST") {
        try {
            // Handle the webhook update
            const update = req.body;
            await bot.handleUpdate(update);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(500).json({ ok: false, error: error.message });
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
};