import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        // Pastikan update berisi pesan teks
        if (!ctx.update?.message || typeof ctx.update.message.text !== "string") {
            return ctx.reply(JSON.stringify(ctx));
        }

        const userId = ctx.update.message.from.id;
        const text = ctx.update.message.text.trim();

        // Hanya jalankan jika menggunakan perintah /gemini atau membalas chat AI
        const isReplyToBot = ctx.update.message.reply_to_message?.from?.is_bot ?? false;
        if (!text.startsWith("/gemini") && !isReplyToBot) return;

        let userMessage = text.replace(/^\/gemini\s*/, "").trim();

        // Jika user membalas pesan bot, gunakan teks balasannya sebagai input
        if (isReplyToBot) {
            const repliedText = ctx.update.message.reply_to_message?.text;
            if (!repliedText) {
                return ctx.reply("❌ Maaf, saya hanya bisa membaca balasan teks!");
            }
            userMessage = text; // Gunakan teks yang diketik user saat membalas
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
                reply_to_message_id: ctx.message?.message_id,
            }).then(() => ctx.api.deleteMessage(ctx.chatId!, loadingMessage.message_id));
        } catch (error) {
            console.error("❌ Error saat memproses Gemini:", error);
            return ctx.reply("Maaf, terjadi kesalahan saat memproses jawaban.");
        }
    }
}

