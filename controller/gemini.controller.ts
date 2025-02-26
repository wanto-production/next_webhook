import type { Context } from 'grammy';

export class GeminiController {

    static async main(ctx: Context) {

        const body = ctx.message?.text?.split(" ").slice(1).join(" ");
        if (!body) {
            return ctx.reply("❌ Tolong masukkan teks setelah /say!");
        }
        ctx.reply(`Kamu berkata: ${body}`);

    }

}
