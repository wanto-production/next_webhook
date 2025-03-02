function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#\+\-=|{}.!\\]/g, '\\$&');
}

// Fungsi untuk mengonversi teks Markdown ke format MarkdownV2
export function convertMarkdownToTelegramMarkdownV2(markdown: string): string {
    // Konversi teks yang memiliki format Markdown biasa ke format MarkdownV2
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold
        .replace(/__(.*?)__/g, '_$1_')      // Italic (menggunakan single underscore)
        .replace(/\[(.*?)\]\((.*?)\)/g, '[$1]($2)')  // Link tetap sama
        .replace(/`([^`]+)`/g, '`$1`')     // Inline code
        .replace(/^#+\s*(.*)$/gm, '*$1*')  // Heading menjadi bold
        .split('\n').map(escapeMarkdownV2).join('\n'); // Escape semua karakter spesial
}
