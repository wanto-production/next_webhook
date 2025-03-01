import { InlineKeyboard, type Context } from "grammy";
import { resetSession } from '@/utils/database'

export class ResetController {

    static async main(c: Context) {
        const pilihan = new InlineKeyboard()
            .text("yes", "reset(yes)")
            .text("no", "reset(no)")

        return c.reply("are you sure to reset chat history gemini?(cannot undo)", {
            reply_markup: pilihan
        })
    }

    static async callback(c: Context) {
        switch (c.callbackQuery?.data) {
            case "reset(yes)": {
                await resetSession(c.from?.id as number)
                await c.reply("history has been reset!")
                break;
            }
            case "reset(no)": {
                await c.reply("reset chat history canceled")
                break;
            }
            default: {
                await c.reply("unknow command")
            }
        }
    }
}
