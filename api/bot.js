const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start command handler (When the user clicks 'Start')
bot.start(async (ctx) => {
    const telegramId = ctx.from.id; // Capture the user's Telegram ID
    // You can store the ID for further interactions (store it in your DB here if needed)
    
    // Reply to the user after they start the bot
    await ctx.reply("Welcome to the game! You can start interacting and mining resources.");
});

// Initialize the bot - This part will be used when Vercel triggers the webhook
bot.launch();  // Make sure bot starts listening for updates

module.exports = bot;
