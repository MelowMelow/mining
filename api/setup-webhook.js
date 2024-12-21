import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export default async (req, res) => {
    if (req.method === "POST") {
        const webhookUrl = `https://mining-pink.vercel.app/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;

        try {
            await bot.telegram.setWebhook(webhookUrl);
            console.log("Webhook set to:", webhookUrl);
            res.status(200).json({ ok: true, message: "Webhook has been set" });
        } catch (err) {
            console.error("Error setting webhook:", err);
            res.status(500).json({ ok: false, error: err.message });
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
};