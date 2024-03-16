import { Bot, CallbackQueryContext, Context } from "grammy";
import { AppCommand } from "./app";
import { BaseCommand } from "./command";

export const WebApps = {
    MOMO: {
        dev: 'https://t.me/mydemox_bot/dev',
        test: 'https://t.me/mydemox_bot/test',
        prod: 'https://t.me/MomoAI_bot/app'
    },
    TgPet:{
        test:'https://t.me/tpdemo_bot/test',
        prod:'https://t.me/TgPetgame_bot/app'
    }
}

const commands = [
    AppCommand
]
const coms: BaseCommand[] = []
export const initCommand = (bot: Bot) => {
    for (const key in commands) {
        const com = Reflect.get(commands, key)
        if (com) {
            const c = new com(bot)
            bot.command(c.key, c.message.bind(c))
            coms.push(c)
        }
    }
}

export const initCallback = (ctx: CallbackQueryContext<Context>) => {
    coms.forEach((com) => {
        const reg = new RegExp(`^${com.key}_`)
        if (ctx.callbackQuery.data.match(reg)) {
            const data = ctx.callbackQuery.data.replace(reg, '')
            com.callback(ctx, data)
        }
    })
}