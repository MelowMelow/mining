const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();

// Create bot instance with token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
app.use(express.json());  // Middleware to parse incoming JSON body

// Handle incoming updates
app.post(`/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body).then(() => {
        res.status(200).send('OK');  // Respond with status 200 when handled correctly
    }).catch((err) => {
        console.error('Error handling webhook:', err);
        res.status(500).send('Error');
    });
});

// Start route: Handle "/start" command
bot.start((ctx) => {
    console.log("User started bot:", ctx.from.id);  // Log user info (optional)
    ctx.reply("Welcome! You can now start interacting and mining resources.");
});

module.exports = app;
