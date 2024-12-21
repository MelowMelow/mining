import { Telegraf } from "telegraf"; // Use import
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export default async (req, res) => {
    if (req.method === "GET") {
        const webhookUrl = `https://minig-pink.vercel.app/api/webhook`;

        try {
            await bot.telegram.setWebhook(webhookUrl);
            console.log("Webhook set to:", webhookUrl);
            res.status(200).send("Webhook has been set.");
        } catch (err) {
            console.error("Error setting webhook:", err);
            res.status(500).send("Error setting webhook.");
        }
    } else {
        // Return 405 for unsupported methods (GET, PUT, etc.)
        res.status(405).send("Method Not Allowed");
    }
};
