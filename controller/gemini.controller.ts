import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";
import TurndownService from "turndown";
import { marked } from "marked";
import { escapeMarkdown } from "@/utils/markdown";

export class GeminiController {
    static async main(ctx: Context) {
        const generatingMap = new Map()
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

        // 🔹 Cek apakah pengguna sudah dalam proses request
        if (generatingMap.get(userId)) {
            return ctx.reply("⚠️ Please wait, your previous request is still being processed...");
        }

        generatingMap.set(userId, true); // Tandai pengguna sedang memproses request

        let chatHistory = (await getSession(userId)) || [];

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

            chatHistory.push({ role: "model", parts: [{ text: response }] });
            await saveSession(userId, chatHistory);

            const htmlRes = await marked(response);
            const markdownRes = escapeMarkdown(turndownServ.turndown(htmlRes))

            await Promise.all([
                ctx.reply(markdownRes, { parse_mode: "MarkdownV2" }),
                ctx.api.deleteMessage(ctx.chatId!, message.message_id),
            ]);

        } catch (err) {
            console.error(err);
            ctx.reply(`Oops! An error occurred: ${(err as Error).message}`);
        } finally {
            generatingMap.delete(userId); // Reset status pengguna setelah selesai
        }
    }

    static async reply(c: Context) {
        const generatingMap = new Map()
        const turndownServ = new TurndownService({
            headingStyle: "atx",
            hr: "---",
            bulletListMarker: "-",
            codeBlockStyle: "fenced",
        })
        if (!c.message?.reply_to_message || c.message.reply_to_message.from?.id !== c.me.id) return;

        const userId = c.from?.id!;
        if (generatingMap.get(userId)) {
            return c.reply("⚠️ Please wait, your previous request is still being processed...");
        }

        generatingMap.set(userId, true);

        const body = c.message.text!;
        let chatHistory = (await getSession(userId)) || [];

        chatHistory = [
            ...chatHistory.map(entry => ({
                role: entry.role,
                parts: entry.parts.map(p => (typeof p === "string" ? { text: p } : p))
            })),
            { role: "user", parts: [{ text: body }] }
        ];

        const chat = model.startChat({ history: chatHistory });

        try {
            const message = await c.reply("Generating response...");
            const send = await chat.sendMessage(body);
            const response = send.response.text();

            chatHistory.push({ role: "model", parts: [{ text: response }] });
            await saveSession(userId, chatHistory);

            const htmlRes = await marked(response, { gfm: true, breaks: true });

            await Promise.all([
                c.reply(htmlRes, { parse_mode: "HTML" }),
                c.api.deleteMessage(c.chatId!, message.message_id)
            ]);
        } catch (err) {
            console.error(err);
            c.reply(`Oops! An error occurred: ${(err as Error).message}`);
        } finally {
            generatingMap.delete(userId);
        }
    }
}
