import { Bot, webhookCallback } from "grammy";

export const bot = new Bot(process.env["TELEGRAM_TOKEN"] as string)

bot.api.setMyCommands([
    { command: "start", description: "bot description" },
    { command: "gemini", description: "for ask gemini ai" }
])

bot.catch((error) => {
    console.log(error.message)
})


export default webhookCallback(bot, 'next-js')
