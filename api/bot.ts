import { Bot, webhookCallback } from "grammy";
import { initCallback, initCommand } from "./commands/config";
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
console.log(token)
const bot = new Bot(token);
initCommand(bot)
bot.catch((err) => {
    console.log(err.message);
})
bot.callbackQuery(/.+/gi, async (ctx) => {
    initCallback(ctx)
})
export default webhookCallback(bot, "http");