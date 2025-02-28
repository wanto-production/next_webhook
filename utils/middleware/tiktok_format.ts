import { Context } from "grammy";

export async function tiktokFormatMiddleware(c: Context) {
    if (
        c.message?.text &&
        !RegExp('https?:\/\/(vt|vn|vm)\.tiktok\.com\/[a-zA-Z0-9]+').test(c.message.text)
    ) {
        await c.reply("Oops wrong format!");
        return;
    }
}
