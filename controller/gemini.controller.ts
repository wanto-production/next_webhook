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

            let chatHistory = await getSession(userId)

            if (chatHistory.length > 0) {
                chatHistory = chatHistory.map(entry => ({
                    role: entry.role,
                    parts: entry.parts.map(p => (typeof p === "string" ? { text: p } : p)) // Konversi string ke objek { text: p }
                }));

                chatHistory.push({
                    role: "user",
                    parts: [{ text: userMessage }]
                });

            }

            const chat = model.startChat({ history: chatHistory })
            try {

                const [send, message] = await Promise.all([
                    chat.sendMessage(userMessage),
                    ctx.reply("generate response...")
                ])

                const response = send.response.text()

                chatHistory.push({
                    role: "model",
                    parts: [{ text: response }]
                });

                await saveSession(userId, chatHistory);

                return ctx.reply(response).then(() => ctx.api.deleteMessage(ctx.chatId!, message.message_id))
            } catch (err) {
                //@ts-ignore
                return ctx.reply(`Ooops ada yang error: ${err.message}`)
            }
        }
    }
}


