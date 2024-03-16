import { CallbackQueryContext, CommandContext, Context } from "grammy";

export class BaseCommand {
    public key=''
    public message(ctx:CommandContext<Context>) {

    }
    public callback(ctx:CallbackQueryContext<Context>,data:string) {
        
    }
}