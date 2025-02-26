import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        // Pastikan update berisi pesan teks
        if (!ctx.update?.message || typeof ctx.update.message.text !== "string") {
            return;
        }

        const userId = ctx.update.message.from.id;
        const text = ctx.update.message.text.trim();

        // Hanya jalankan jika menggunakan perintah /gemini atau membalas chat AI
        const replyMessage = ctx.update.message.reply_to_message;
        const isReplyToBot = replyMessage?.from?.id === ctx.me.id; // Pastikan hanya balas ke bot sendiri

        if (!text.startsWith("/gemini") && !isReplyToBot) return;

        let userMessage = text.replace(/^\/gemini\s*/, "").trim();

        // Jika user membalas pesan bot, gunakan teks balasannya sebagai input
        if (isReplyToBot) {
            if (isReplyToBot) {
                userMessage = text.replace(/^\/gemini\s*/, "").trim(); // Ambil teks setelah /gemini

                if (!userMessage) {
                    return ctx.reply("❌ Tolong masukkan teks setelah /gemini!\n\n*Contoh:* `/gemini Apa itu AI?`", {
                        parse_mode: "Markdown",
                    });
                }
            }
        }

        if (!userMessage) {
            return ctx.reply("❌ Tolong masukkan teks setelah /gemini!\n\n*Contoh:* `/gemini Apa itu AI?`", {
                parse_mode: "Markdown",
            });
        }

        let chatHistory = await getSession(userId);

        // Jika bukan reply ke bot, reset history
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
                reply_to_message_id: ctx.update.message.message_id,
            }).then(() => ctx.api.deleteMessage(ctx.chatId!, loadingMessage.message_id));
        } catch (error) {
            console.error("❌ Error saat memproses Gemini:", error);
            return ctx.reply("Maaf, terjadi kesalahan saat memproses jawaban.");
        }
    }
}


