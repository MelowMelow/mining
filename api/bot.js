import { Telegraf } from "telegraf"; // Use ES imports instead of require
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start command handler (When the user clicks 'Start')
bot.start(async (ctx) => {
    const telegramId = ctx.from.id; // Capture the user's Telegram ID
    await ctx.reply("Welcome to the game! You can start interacting and mining resources.");
});

// You can add other command handlers or functionalities here

bot.launch(); // Launch the bot

export default bot; // Use export default for exporting the bot instance
