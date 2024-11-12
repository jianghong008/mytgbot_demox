import { Bot, CallbackQueryContext, Context } from "grammy";
import { AppCommand } from "./app";
import { BaseCommand } from "./command";
import { RpsGameCommand } from "./rps-game";

export const WebApps = {
    momoMini: {
        dev: 'https://t.me/mydemox_bot/dev?mode=compact',
        test: 'https://t.me/mydemox_bot/test?mode=compact',
        prod: 'https://t.me/MomoAI_bot/app?mode=compact'
    },
    momoWeb: {
        momoai: 'https://www.momoai.io/',
        momo: 'https://www.momo.meme/'
    },
    momoSdk: {
        dev: 'https://t.me/mmsdk_test_bot/mmsdk'
    },
    tflag: {
        test: 'https://t.me/FlagDev_bot/DevTFlag',
        prod: 'https://t.me/Tflagbot/app'
    },
    momox: {
        test: 'https://t.me/momox_test_bot/test',
        prod: 'https://t.me/momox_momobot/app'
    }
}

const commands = [
    AppCommand,
    RpsGameCommand,
]
const coms: BaseCommand[] = []
export const initCommand = (bot: Bot) => {
    for (const key in commands) {
        const com = Reflect.get(commands, key)
        if (com) {
            const c = new com(bot)
            bot.command(c.key, c.setup.bind(c))
            coms.push(c)
        }
    }

    // bot.on('message',ctx=>{
    //     coms.forEach((com) => {
    //         com.message(ctx)
    //     })

    // })

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