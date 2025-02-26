import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        // Pastikan update berisi pesan byte
        if (ctx.message?.text) {
            const userMessage = ctx.message?.text.split(' ').slice(1).join(' ')!
            const userId = ctx.from?.id

            if (!userMessage) return ctx.reply("please fill text after /gemini");

            let chatHistory = await getSession(userId) || []

            //const response = await chat.sendMessage(userMessage)

            //console.log(userId, userMessage, response)
            ctx.reply(JSON.stringify(chatHistory))

        }
    }
}


