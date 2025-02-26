import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        if (!ctx.message?.text) return ctx.reply("Maaf, saya hanya bisa memproses pesan teks.");

        const userId = ctx.message.from.id;
        const text = ctx.message.text.trim();

        // Pastikan hanya berjalan jika perintahnya adalah /gemini
        if (!text.startsWith("/gemini")) return;

        // Ambil teks setelah /gemini
        const userMessage = text.replace(/^\/gemini\s*/, "").trim();
        if (!userMessage) {
            return ctx.reply("❌ Tolong masukkan teks setelah /gemini!\n\n*Contoh:* `/gemini Apa itu AI?`", {
                parse_mode: "Markdown",
            });
        }

        // Cek apakah pesan adalah reply ke bot
        const isReplyToBot = ctx.message.reply_to_message && ctx.message.reply_to_message.from?.is_bot;

        let chatHistory = await getSession(userId);

        // Jika tidak reply ke bot, reset chat history
        if (!isReplyToBot) {
            chatHistory = [];
        }

        const chat = model.startChat({ history: chatHistory });

        try {
            const [loadingMessage, result] = await Promise.all([
                ctx.reply("⏳ Menghasilkan respon..."),
                chat.sendMessage(userMessage),
            ]);

            const response = result.response.text();

            // Tambahkan ke history percakapan
            chatHistory.push({ role: "user", parts: [userMessage] });
            chatHistory.push({ role: "model", parts: [response] });

            await saveSession(userId, chatHistory);

            console.log(`Gemini digunakan oleh ${ctx.from?.username}, bertanya: ${userMessage}`);

            // Kirim balasan dan hapus pesan loading
            return ctx.reply(response, {
                parse_mode: "Markdown",
                reply_to_message_id: ctx.message.message_id,
            }).then(() => ctx.api.deleteMessage(ctx.chatId!, loadingMessage.message_id));
        } catch (error) {
            console.error("❌ Error saat memproses Gemini:", error);
            return ctx.reply("Maaf, terjadi kesalahan saat memproses jawaban.");
        }
    }
}

