const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
app.use(express.json()); // Middleware to parse JSON data

// Create a new Telegraf bot instance with the token stored in environment variables
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start command handler (When the user clicks 'Start')
bot.start(async (ctx) => {
    const telegramId = ctx.from.id; // Capture the user's Telegram ID
    console.log(`Received /start command from user ID: ${telegramId}`); // Log incoming /start command

    // You can store the ID for further interactions (store in your DB here if needed)
    
    // Reply to the user after they start the bot
    await ctx.reply("Welcome to the game! You can start interacting and mining resources.");
    console.log(`Replied to user ID: ${telegramId}`); // Log reply action
});

// Webhook route - Telegram will send updates to this endpoint
app.post(`/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    console.log("Received update from Telegram: ", req.body); // Log the incoming update
    
    try {
        bot.handleUpdate(req.body, res); // Process incoming updates from Telegram
    } catch (error) {
        console.error("Error processing the update:", error); // Log errors in processing updates
    }
});

// Set the webhook URL for Telegram (Vercel)
const setWebhook = async () => {
    const webhookUrl = `https://mining-pink.vercel.app/api/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
    console.log(`Attempting to set webhook to: ${webhookUrl}`); // Log the webhook URL

    try {
        await bot.telegram.setWebhook(webhookUrl); // Set the Telegram webhook
        console.log("Webhook successfully set to:", webhookUrl); // Log success
    } catch (err) {
        console.error("Error setting webhook:", err); // Log errors if any
    }
};

// Call to set webhook (called when function is invoked)
app.get("/setup-webhook", async (req, res) => {
    console.log("Initializing webhook setup..."); // Log webhook setup attempt
    await setWebhook(); // Call the setWebhook function
    res.status(200).send("Webhook has been set.");
    console.log("Webhook setup completed."); // Log webhook setup completion
});

// Export the Express app required for Vercel to handle the serverless request
module.exports = app;
