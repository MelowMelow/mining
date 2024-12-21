const { Telegraf } = require('telegraf');
const app = require('express')();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.get('/setup-webhook', async (req, res) => {
    const webhookUrl = `https://mining-pink.vercel.app/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
    try {
        await bot.telegram.setWebhook(webhookUrl);
        console.log("Webhook set to:", webhookUrl);
        res.status(200).send("Webhook has been set.");
    } catch (err) {
        console.error("Error setting webhook:", err);
        res.status(500).send("Error setting webhook.");
    }
});

module.exports = app;
