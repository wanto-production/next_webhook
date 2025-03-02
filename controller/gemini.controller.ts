import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";
import TurndownService from "turndown";
import { marked } from "marked";
import { escapeMarkdown } from "@/utils/markdown";

export class GeminiController {
    static async main(ctx: Context) {

        const turndownServ = new TurndownService({
            headingStyle: "atx",
            hr: "---",
            bulletListMarker: "-",
            codeBlockStyle: "fenced",
        })


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

            const htmlRes = await marked(response)
            // Kirim jawaban dan hapus pesan "Generating response..." secara paralel
            await Promise.all([
                ctx.reply(escapeMarkdown(turndownServ.turndown(htmlRes)), { parse_mode: "MarkdownV2" }),
                ctx.api.deleteMessage(ctx.chatId!, message.message_id)
            ]);
        } catch (err) {
            console.error(err);
            return ctx.reply(`Oops! An error occurred: ${(err as Error).message}`);
        }
    }

    static async reply(c: Context) {
        if (c.message?.reply_to_message) {
            const messageReply = c.message.reply_to_message
            if (messageReply.from?.id === c.me.id) {
                const turndownServ = new TurndownService({
                    headingStyle: "atx",
                    hr: "---",
                    bulletListMarker: "-",
                    codeBlockStyle: "fenced",
                })


                const body = c.message.text!
                const userId = c.from?.id!

                let chatHistory = (await getSession(userId)) || []

                // Konversi history agar sesuai format, lalu tambahkan input user
                chatHistory = [
                    ...chatHistory.map(entry => ({
                        role: entry.role,
                        parts: entry.parts.map(p => (typeof p === "string" ? { text: p } : p))
                    })),
                    { role: "user", parts: [{ text: body }] }
                ];

                const chat = model.startChat({ history: chatHistory })

                try {
                    const message = await c.reply("Generating response...");
                    const send = await chat.sendMessage(body);
                    const response = send.response.text();

                    // Simpan respons ke dalam history
                    chatHistory.push({ role: "model", parts: [{ text: response }] });
                    await saveSession(userId, chatHistory);

                    const htmlRes = await marked(response)
                    console.log(htmlRes)
                    // Kirim jawaban dan hapus pesan "Generating response..." secara paralel
                    await Promise.all([
                        c.reply(escapeMarkdown(turndownServ.turndown(htmlRes)), { parse_mode: "MarkdownV2" }),
                        c.api.deleteMessage(c.chatId!, message.message_id)
                    ]);
                } catch (err) {
                    console.error(err);
                    return c.reply(`Oops! An error occurred: ${(err as Error).message}`);
                }

            }
        }
    }
}
