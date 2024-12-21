// /api/webhook.js
import { Telegraf } from "telegraf"; // Use import instead of require
import bodyParser from 'body-parser'; // Use import for body-parser
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export default async (req, res) => {
    if (req.method === "POST") {
        // Manually parse the body using body-parser
        bodyParser.json()(req, res, async () => {
            try {
                // Ensure Telegram updates are handled properly
                await bot.handleUpdate(req.body);
                res.status(200).send("OK");
            } catch (err) {
                console.error("Error handling update:", err);
                res.status(500).send("Error processing update");
            }
        });
    } else {
        // Return 405 for unsupported methods (GET, PUT, etc.)
        res.status(405).send("Method Not Allowed");
    }
};
