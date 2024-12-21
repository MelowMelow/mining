const { Telegraf } = require("telegraf");
const app = require("express")();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Webhook route - Telegram will send updates to this endpoint
app.post(`/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body, res); // Process incoming updates from Telegram
});

module.exports = app;
