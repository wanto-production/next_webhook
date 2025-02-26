import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        // Pastikan update berisi pesan teks
        ctx.reply(`
            <pre>
                ${JSON.stringify(ctx)}
            </pre>
        `, {
            parse_mode: "HTML"
        })
    }
}


