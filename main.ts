import { Bot } from "grammy";
import { initCallback, initCommand } from "./commands/config";
import { loadEnv } from "./utils/env";

async function main() {
  const envs = await loadEnv()
  const bot = new Bot(envs.BOT_TOKEN);
  initCommand(bot)
  bot.catch((err) => {
    console.log(err.message);
  })
  bot.callbackQuery(/.+/gi, async (ctx) => {
    initCallback(ctx)
  })
  bot.start();
}

main()