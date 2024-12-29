import { Telegraf } from "telegraf";

// Initialize the bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Handle the /start command
bot.start((ctx) => {
    const args = ctx.message.text.split(" ");
    let referralCode = null;

    if (args.length > 1) {
        // Extract referral code if provided (e.g., /start referral_code)
        referralCode = args[1];
        console.log("Referral code received:", referralCode);

        // Optionally, process the referral code (e.g., save it to a database)
        saveReferral(ctx.from.id, referralCode);
    }

    // Send a welcome message
    const welcomeMessage = referralCode 
        ? `Welcome! Thanks for using the referral code: ${referralCode}. Start mining resources here: t.me/theminecryptobot/marsmine.` 
        

    return ctx.reply(welcomeMessage);
});

// Optional: A mock function to handle referral processing
function saveReferral(userId, referralCode) {
    // Example: Save the referral to a database (replace with your actual implementation)
    console.log(`Saving referral: userId=${userId}, referralCode=${referralCode}`);
    // Add your database logic here
}

// Webhook handler for deployment
export default async (req, res) => {
    if (req.method === "POST") {
        try {
            const update = req.body;
            await bot.handleUpdate(update);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error("Error handling webhook:", error);
            res.status(500).json({ ok: false, error: error.message });
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
};
