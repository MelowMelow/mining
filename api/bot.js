// /api/bot.js
const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
app.use(express.json()); // Middleware to parse JSON data

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN); // Telegram Bot token

// /start command handler (When the user clicks 'Start')
bot.start(async (ctx) => {
    const telegramId = ctx.from.id; // Capture the user's telegram ID
    // You can store the ID for further interactions (save to your DB here)

    // Reply to the user after they start the bot
    await ctx.reply("Welcome to the game! You can start interacting and mining resources.");
});

// Webhook route - Telegram sends updates to this endpoint
app.post(`/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body, res); // Process the update from Telegram
});

// This is required for Vercel to handle serverless requests
module.exports = app;


const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);  // Use your bot token from the environment variable

// Define the /start command for when the user presses 'Start'
bot.start(async (ctx) => {
    const telegramId = ctx.from.id;  // Capture the user's telegram ID
    // Respond to the user
    await ctx.reply("Welcome to the game! You can start interacting and mining resources.");
});

// Set the Telegram webhook URL for your Vercel app
const setWebhook = async () => {
    const webhookUrl = `https://mining-pink.vercel.app/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
    await bot.telegram.setWebhook(webhookUrl); // Set the webhook for Telegram to send updates to Vercel
    console.log("Webhook set to:", webhookUrl);  // Optionally, log it to the console
};

// Call this function to set the webhook
setWebhook();

// Launch the bot (will run on Vercel)
bot.launch();



