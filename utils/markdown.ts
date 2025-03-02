export function escapeMarkdownV2(text: string): string {
    // Karakter yang harus di-escape di MarkdownV2 Telegram
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

    // Menggunakan regex untuk menggantikan setiap karakter dengan versi yang di-escape
    const escapedText = text.replace(/[_*\[\]()~`>#\+\-=|{}.!]/g, '\\$&');

    return escapedText;
}
