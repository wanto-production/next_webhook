import { Bot, webhookCallback } from "grammy";
import { MessageController } from "@/controller/message.controller";
import { GeminiController } from '@/controller/gemini.controller';
import { ResetController } from '@/controller/reset.controller'

const bot = new Bot(process.env["TELEGRAM_TOKEN"] as string)

bot.api.setMyCommands([
    { command: "start", description: "bot description" },
    { command: "gemini", description: "to ask gemini" },
    { command: "reset", description: "to reset chat history gemini" }
])

bot.command("start", (c) => {
    c.reply("hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n")
})

bot.command('gemini', GeminiController.main)
bot.command('reset', ResetController.main)
bot.on("callback_query", ResetController.callback)

bot.on("message", MessageController.main)

bot.catch((error) => {
    console.log(error.message)
})

export default webhookCallback(bot, 'next-js')
