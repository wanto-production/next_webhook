import { Bot, webhookCallback } from "grammy";
import { MessageController } from "@/controller/message.controller";

const bot = new Bot(process.env["TELEGRAM_TOKEN"] as string)

bot.api.setMyCommands([
    { command: "start", description: "bot description" }
])

bot.command("start", (c) => {
    c.reply("hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n")
})

bot.on("message", MessageController.main)

bot.catch((error) => {
    console.log(error.message)
})

export default webhookCallback(bot, 'next-js')
