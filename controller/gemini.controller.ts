import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        if (!ctx.message?.text) return;

        const userMessage = ctx.message.text.split(" ").slice(1).join(" ");
        if (!userMessage) return ctx.reply("Please fill text after /gemini");

        const userId = ctx.from?.id;
        let chatHistory = (await getSession(userId)) || [];

        // Konversi history agar sesuai format, lalu tambahkan input user
        chatHistory = [
            ...chatHistory.map(entry => ({
                role: entry.role,
                parts: entry.parts.map(p => (typeof p === "string" ? { text: p } : p))
            })),
            { role: "user", parts: [{ text: userMessage }] }
        ];

        const chat = model.startChat({ history: chatHistory });

        try {
            const message = await ctx.reply("Generating response...");
            const send = await chat.sendMessage(userMessage);
            const response = send.response.text();

            // Simpan respons ke dalam history
            chatHistory.push({ role: "model", parts: [{ text: response }] });
            await saveSession(userId, chatHistory);

            // Kirim jawaban dan hapus pesan "Generating response..." secara paralel
            await Promise.all([
                ctx.reply(response, { parse_mode: "Markdown" }),
                ctx.api.deleteMessage(ctx.chatId!, message.message_id)
            ]);
        } catch (err) {
            console.error(err);
            return ctx.reply(`Oops! An error occurred: ${(err as Error).message}`);
        }
    }
}
