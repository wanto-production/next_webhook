import { bot } from "@/pages/api/webhook";


bot.command("start", (c) => {
    c.reply("hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n")
})
