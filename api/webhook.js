import { Telegraf } from "telegraf"; // Import Telegraf
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export default async (req, res) => {
    if (req.method === "GET") {
        const webhookUrl = `https://mining-pink.vercel.app/api/webhook`;

        try {
            // Set Telegram Webhook
            await bot.telegram.setWebhook(webhookUrl);
            console.log("Webhook set to:", webhookUrl);
            res.status(200).send("Webhook has been set.");
        } catch (err) {
            console.error("Error setting webhook:", err);
            res.status(500).send("Error setting webhook.");
        }
    } else {
        // Return Method Not Allowed for anything except GET
        res.status(405).send("Method Not Allowed");
    }
};
