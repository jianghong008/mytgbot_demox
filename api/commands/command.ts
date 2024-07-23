import { CallbackQueryContext, CommandContext, Context } from "grammy";

export class BaseCommand {
    public key=''
    public active = false
    public setup(ctx:CommandContext<Context>) {
        this.active = true
    }
    public message(ctx:Context){
        
    }
    public callback(ctx:CallbackQueryContext<Context>,data:string) {
        
    }
}