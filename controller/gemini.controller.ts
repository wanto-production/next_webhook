import type { Context } from 'grammy';
import { model } from '@/utils/gemini';
import { getSession, saveSession } from '@/utils/database';

export class GeminiController {

    static async main(ctx: Context) {
        const userId = ctx.message?.from.id;

        // Cek apakah pesan adalah reply ke bot
        const isReplyToBot = ctx.message?.reply_to_message && ctx.message?.reply_to_message.from?.is_bot;

        let chatHistory = await getSession(userId)

        // Jika user baru atau tidak reply ke AI, mulai sesi baru
        if (!isReplyToBot) {
            chatHistory = [];
        }

        const chat = model.startChat({ history: chatHistory })

        const body = ctx.message?.text?.split(" ").slice(1).join(" ");
        if (!body) {
            return ctx.reply("❌ Tolong masukkan teks setelah /say!");
        }

        const [message, result] = await Promise.all([
            ctx.reply("generate response..."),
            chat.sendMessage(body)
        ])
        const response = result.response.text()

        // Tambahkan ke riwayat percakapan
        chatHistory.push({ role: "user", parts: [body] });
        chatHistory.push({ role: "model", parts: [response] });

        await saveSession(userId, chatHistory)

        console.log(`gemini usage by ${ctx.from?.username}, ask: ${body}`)

        return ctx.reply(response, {
            parse_mode: "Markdown"
        }).then(() => ctx.api.deleteMessage(ctx.chatId!, message.message_id))

    }

}
