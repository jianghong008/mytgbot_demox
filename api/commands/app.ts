import { Bot, CallbackQueryContext, CommandContext, Context, InlineKeyboard } from "grammy";
import { BaseCommand } from "./command";
import { WebApps } from "./config";
import { InlineKeyboardButton } from "@grammyjs/types";

export class AppCommand extends BaseCommand {
    public key = 'app'
    bot: Bot;
    pswd = '8562'
    inputs = new Map<number, { time: number, value: string }>()
    mid = 0
    state = {
        time: 0,
        errCount: 0,
        maxErr: 4
    }
    constructor(bot: Bot) {
        super()
        this.bot = bot;
    }
    async setup(ctx: CommandContext<Context>) {
        super.setup(ctx)
        if (this.mid > 0) {
            ctx.api.deleteMessages(ctx.chat!.id, [this.mid]).catch(console.log)
        }
        this.inputs.clear()
        const bts = []
        const icons:string[] = ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓']
        for (let i = 0; i < 3; i++) {
            const ar = []
            for (let u = 0; u < 3; u++) {
                const btnId = i * 3 + u + 1
                ar.push({
                    text: `${icons[i * 3 + u]}`,
                    callback_data: this.key + "_" + btnId
                })
            }
            bts.push(ar)
        }
        const uid = ctx.from?.id

        uid && this.inputs.set(uid, { time: Date.now(), value: '' })
        const msg = await ctx.reply('😀 *You know I love those fruits?* 👇', {
            reply_markup: {
                inline_keyboard: bts,
            },
            parse_mode: 'Markdown',
        }).catch(console.log)
        if (msg) {
            this.mid = msg.message_id
        }
    }
    private getChatEnvIcon(env?: string) {
        switch (env) {
            case 'group':
                return '👥'
            case 'supergroup':
                return '👥'
            case 'private':
                return '🤡'
            case 'channel':
                return '🔊'
            default:
                return '👽'
        }
    }
    async callback(ctx: CallbackQueryContext<Context>, data: string) {
        if (!data) {
            return
        }
        if (this.inputs.size == 0) {
            const cont = '👻 _invalid input_ 👻'
            ctx.editMessageText(cont, {
                parse_mode: 'Markdown'
            }).catch(console.log)
            console.log('invalid input')
            return
        }
        const uid = ctx.from.id
        const input = this.inputs.get(uid)
        if (input === undefined) {
            const cont = `😱 _not allow_ 😡`
            ctx.reply(cont, {
                parse_mode: 'Markdown'
            }).catch(console.log)
            return
        }

        if (input.time + 1000 * 30 < Date.now()) {
            this.inputs.delete(uid)
            const cont = `🕰 _time out_ 🕰`
            ctx.editMessageText(cont, {
                parse_mode: 'Markdown'
            }).catch(console.log)
            console.log('time out')
            return
        }

        if (input.value.length < 3) {
            this.inputs.set(uid, {
                time: Date.now(),
                value: input.value + data
            })
        } else if (input.value + data === this.pswd) {
            console.log('ok')
            const curEnv = this.getChatEnvIcon(ctx.chat?.type)
            const lines: string[] = [`env【*${curEnv}*】 dev/test app\n`]
            let index = 0
            const btnCont: InlineKeyboardButton[][] = []
            let line = 0
            for (const name in WebApps) {
                const webapp = Reflect.get(WebApps, name)
                if (!webapp) {
                    continue
                }
                const temp: InlineKeyboardButton[] = []
                lines.push(`*${line + 1}*. 👉 ${name}`)
                for (const key in webapp) {

                    if (/^https:\/\/t\.me/.test(webapp[key])) {
                        temp.push({
                            text: `⏺ ${line + 1}. ${key}`,
                            url: webapp[key]
                        },)
                    } else if (ctx.chat?.type === 'private') {
                        temp.push({
                            text: `⏺ ${line + 1}. ${key}`,
                            web_app: {
                                url: webapp[key]
                            }
                        },)
                    } else {
                        temp.push({
                            text: `⏺ ${line + 1}. ${key}`,
                            url: webapp[key]
                        },)
                    }
                    index++
                }
                btnCont.push(temp)

                line++
            }

            ctx.editMessageText(lines.join('\n'), {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: btnCont
                }
            }).then(() => {
                this.inputs.delete(uid)
            }).catch(console.log)
        } else if (input.value.length === 3) {
            this.state.errCount++
            this.inputs.delete(uid)
            const cont = `😭 _No, I don't like them!_`
            ctx.editMessageText(cont, {
                parse_mode: 'Markdown'
            }).catch(console.log)
        }
    }
}