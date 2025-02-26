import { createClient } from "@libsql/client";

export const db = createClient({
    url: process.env["TURSO_URL"]!,
    authToken: process.env["TURSO_KEY"]!
})

export async function getSession(userId: any) {
    const result = await db.execute({
        sql: "SELECT chat_history FROM sessions WHERE user_id = $userId",
        args: { userId },
    });

    if (result.rows.length > 0) {
        return JSON.parse((result.rows[0] as any)?.chat_history);
    }
    return [];
}

export async function saveSession(userId: any, chatHistory: any) {
    const historyJson = JSON.stringify(chatHistory);
    await db.execute({
        sql: `
            INSERT INTO sessions (user_id, chat_history) 
            VALUES (?, ?) 
            ON CONFLICT(user_id) 
            DO UPDATE SET chat_history = excluded.chat_history
        `,
        args: [userId, historyJson],
    });
}
