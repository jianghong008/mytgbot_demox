import { Bot, CallbackQueryContext, CommandContext, Context, InlineKeyboard } from "grammy";
import { BaseCommand } from "./command";
import { WebApps } from "./config";

export class AppCommand extends BaseCommand {
    public key = 'app'
    bot: Bot;
    pswd = '8562'
    inputs = new Map<number, { time: number, value: string }>()
    mid = 0
    constructor(bot: Bot) {
        super()
        this.bot = bot;
    }
    async setup(ctx: CommandContext<Context>) {
        super.setup(ctx)
        if(this.mid>0){
            ctx.api.deleteMessages(ctx.chat!.id, [this.mid]).catch(console.log)
        }
        this.inputs.clear()
        const bts = []
        for (let i = 0; i < 3; i++) {
            const ar = []
            for (let u = 0; u < 3; u++) {
                const btnId = i * 3 + u + 1
                ar.push({
                    text: '⁕',
                    callback_data: this.key + "_" + btnId
                })
            }
            bts.push(ar)
        }
        const uid = ctx.from?.id

        uid && this.inputs.set(uid, { time: Date.now(), value: '' })
        const msg = await ctx.reply('input code', {
            reply_markup: {
                inline_keyboard: bts,
                remove_keyboard: true
            },
            parse_mode: 'HTML',
        }).catch(console.log)
        if(msg){
            this.mid = msg.message_id
        }
    }
    async callback(ctx: CallbackQueryContext<Context>, data: string) {
        if (!data) {
            return
        }
        ctx.answerCallbackQuery();
        const uid = ctx.from.id
        const input = this.inputs.get(uid)
        if (input === undefined) {
            this.inputs.delete(uid)
            const cont = `invalid input`
            ctx.editMessageText(cont, {
                parse_mode: 'HTML'
            })
            return
        }
        if (input.time + 1000 * 30 < Date.now()) {
            this.inputs.delete(uid)
            const cont = `time out`
            ctx.editMessageText(cont, {
                parse_mode: 'HTML'
            })
            console.log('time out')
            return
        }
        this.inputs.set(uid, {
            time: Date.now(),
            value: input.value + data
        })
        if (input.value + data === this.pswd) {
            this.inputs.delete(uid)
            const cont = `dev/test app`
            let index = 0
            const btnCont: any[] = []
            let temp = []
            for (const name in WebApps) {
                const webapp = Reflect.get(WebApps, name)
                if (!webapp) {
                    continue
                }
                for (const key in webapp) {
                    if (index % 3 == 0) {
                        temp = []
                    }
                    if (/^https:\/\/t\.me/.test(webapp[key])) {
                        temp.push({
                            text: `${name}_${key}`,
                            url: webapp[key]
                        },)
                    } else {
                        temp.push({
                            text: `${name}_${key}`,
                            url: webapp[key]
                        },)
                    }
                    index++
                }
                btnCont.push(temp)
            }

            ctx.editMessageText(cont, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: btnCont
                }
            })
        } else if (input.value.length === 3) {
            this.inputs.delete(uid)
            const cont = `code error`
            ctx.editMessageText(cont, {
                parse_mode: 'HTML'
            })
        }
    }
}