function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#\+\-=|{}.!\\]/g, '\\$&');
}

// Fungsi untuk mengonversi teks Markdown ke format MarkdownV2
export function convertMarkdownToTelegramMarkdownV2(markdown: string): string {
    return markdown
        .replace(/\*/g, '\\*')   // Escape bintang (*)
        .replace(/_/g, '\\_')    // Escape underscore (_)
        .replace(/\[/g, '\\[')   // Escape bracket kiri ([)
        .replace(/\]/g, '\\]')   // Escape bracket kanan (])
        .replace(/\(/g, '\\(')   // Escape kurung buka (()
        .replace(/\)/g, '\\)')   // Escape kurung tutup ())
        .replace(/~/g, '\\~')    // Escape tilde (~)
        .replace(/`/g, '\\`')    // Escape backtick (`)
        .replace(/>/g, '\\>')    // Escape tanda lebih besar (>)
        .replace(/#/g, '\\#')    // Escape pagar (#)
        .replace(/\+/g, '\\+')   // Escape plus (+)
        .replace(/-/g, '\\-')    // Escape minus (-)
        .replace(/=/g, '\\=')    // Escape sama dengan (=)
        .replace(/\|/g, '\\|')   // Escape pipe (|)
        .replace(/{/g, '\\{')    // Escape kurung kurawal buka ({)
        .replace(/}/g, '\\}')    // Escape kurung kurawal tutup (})
        .replace(/\./g, '\\.')   // Escape titik (.)
        .replace(/!/g, '\\!');   // Escape tanda seru (!)l
}
