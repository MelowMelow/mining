// /api/setup-webhook.js
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const webhookUrl = `https://mining-pink.vercel.app/api/bot`;  // Set this to your bot webhook URL

        try {
            await bot.telegram.setWebhook(webhookUrl);
            console.log("Webhook set to:", webhookUrl);
            res.status(200).send("Webhook has been set.");
        } catch (err) {
            console.error("Error setting webhook:", err);
            res.status(500).send("Error setting webhook.");
        }
    } else {
        // Return 405 if the method is not GET
        res.status(405).send("Method Not Allowed");
    }
};
