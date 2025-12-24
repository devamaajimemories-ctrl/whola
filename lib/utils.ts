// lib/utils.ts
export function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}