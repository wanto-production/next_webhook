export function escapeMarkdownV2(text: string): string {
    return text
        .replace(/_/g, "\\_") // Escape underscore
        .replace(/\*/g, "\\*") // Escape asterisk
        .replace(/\[/g, "\\[") // Escape bracket [
        .replace(/\]/g, "\\]") // Escape bracket ]
        .replace(/\(/g, "\\(") // Escape parenthesis (
        .replace(/\)/g, "\\)") // Escape parenthesis )
        .replace(/`/g, "\\`") // Escape backtick `
        .replace(/\./g, "\\.") // Escape dot
        .replace(/-/g, "\\-") // Escape dash
        .replace(/#/g, "\\#"); // Escape hash
}
