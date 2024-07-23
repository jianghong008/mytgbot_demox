import { Bot, CallbackQueryContext, CommandContext, Context, InlineKeyboard } from "grammy";
import { BaseCommand } from "./command";
import { InlineKeyboardButton } from "@grammyjs/types";

export class RpsGameCommand extends BaseCommand {
    public key = 'rps'
    bot: Bot;
    private data = new Map<number, { time: number, value: string, name: string }>()
    private game = {
        isStart: false,
        time: 0,
        mid: 0,
        duration: 60 * 15
    }
    constructor(bot: Bot) {
        super()
        this.bot = bot;
    }
    async setup(ctx: CommandContext<Context>) {
        super.setup(ctx)
        if (this.game.mid > 0) {
            ctx.api.deleteMessages(ctx.chat!.id, [this.game.mid]).catch(console.log)
        }
        this.data.clear()
        this.game.isStart = true
        this.game.time = Date.now()
        console.log('game start')
        const msg = await ctx.reply(`
            *rock-paper-scissors game*
_Click the button below to participate in the game_
${this.data.size}/2 players joined
Remaining time :${this.game.duration}s
            `, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: this.createGameBtns()
            }
        }).catch(console.log)
        if (!msg) return
        this.game.mid = msg.message_id
    }
    private createGameBtns() {
        const bts: InlineKeyboardButton[][] = [
            [
                {
                    text: '✊',
                    callback_data: this.key + '_rock'
                },
                {
                    text: '✋',
                    callback_data: this.key + '_paper'
                },
                {
                    text: '✌️',
                    callback_data: this.key + '_scissors'
                }
            ]
        ]
        return bts
    }
    async callback(ctx: CallbackQueryContext<Context>, data: string) {
        ctx.answerCallbackQuery().catch(console.log);
        if (this.game.time + 1000 * this.game.duration < Date.now()) {
            this.game.isStart = false
            ctx.editMessageText('game over').catch(console.log)
            return
        }
        const curName = ctx.from.first_name + ' ' + ctx.from.last_name
        if (this.data.has(ctx.from.id)) {
            console.log(`already joined @(${curName})`)
            ctx.reply(`already joined @[${curName}](tg://user?id=${ctx.from.id})`, {
                parse_mode: 'Markdown'
            })
                .catch(console.log);
            return
        }
        if (this.data.size >= 2) {
            console.log(`Waiting for the game to end @(${curName})`)
            ctx.reply(`Waiting for the game to end @[${curName}](tg://user?id=${ctx.from.id})`, {
                parse_mode: 'Markdown'
            })
                .catch(console.log);
            return
        }

        this.data.set(ctx.from.id, {
            time: Date.now(),
            value: data,
            name: curName
        })
        if (this.data.size < 2) {
            const dt = Math.round(Date.now()-this.game.time)
            ctx.editMessageText(`
                *rock-paper-scissors game*
    _Click the button below to participate in the game_
    ${this.data.size}/2 players joined
    Remaining time :${dt}s
                `, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: this.createGameBtns()
                }
            }).catch(console.log);
            return
        }
        const user = {
            uid: 0,
            value: '',
            name: '',
            winner: 0,
            winnerName: ''
        }

        this.data.forEach((value, uid) => {
            if (!user.uid) {
                user.uid = uid
                user.value = value.value
                user.name = value.name
            } else {
                if ((user.value == 'rock' && value.value == 'scissors') || (user.value == 'paper' && value.value == 'rock') || (user.value == 'scissors' && value.value == 'paper')) {
                    user.winner = user.uid
                    user.winnerName = user.name
                }else if(user.value == value.value){
                    user.winner = 0
                } else {
                    user.winner = uid
                    user.winnerName = value.name
                }
            }
        })

        ctx.editMessageText('game over').catch(console.log);
        let winMsg = `congratulations, @[${curName}](tg://user?id=${ctx.from.id}) is the winner! 🎉 `
        if(user.winner == 0){
            winMsg = `it's a tie! 🤝 `
        }
        ctx.reply(winMsg, {
            parse_mode: 'Markdown'
        }).catch(console.log);
    }

}