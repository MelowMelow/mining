// /api/webhook.js
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

module.exports = async (req, res) => {
    if (req.method === "POST") {
        try {
            // Process incoming updates from Telegram
            await bot.handleUpdate(req.body);
            res.status(200).send("OK");
        } catch (err) {
            console.error("Error handling update:", err);
            res.status(500).send("Error processing update");
        }
    } else {
        // Return 405 for unsupported methods (GET, PUT, etc.)
        res.status(405).send("Method Not Allowed");
    }
};
