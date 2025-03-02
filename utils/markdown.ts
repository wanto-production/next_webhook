export function escapeMarkdownV2(text: string): string {
    return text
        .replace(/(\*{3,})/g, "**") // Menghindari *** yang tidak jelas
        .replace(/(\*{2})([^*]+)\1?/g, "**$2**") // Memastikan **bold** selalu ditutup
        .replace(/(\*)([^*]+)\1?/g, "*$2*") // Memastikan *italic* selalu ditutup
        .replace(/(`{2,})/g, "`") // Menghindari ```` yang berlebihan
        .replace(/(\[)([^\]]+)(\]\()/g, "[$2](") // Menormalkan format link
        .replace(/\[(.*?)\]\((?!http)(.*?)\)/g, "[$1](https://$2)"); // Auto-perbaiki link tanpa protocol}
}
