export const PII_PATTERNS = [
    { name: "Phone Number", regex: /(\+91[\-\s]?)?[6789]\d{9}/ },
    { name: "Phone Number (Generic)", regex: /\b\d{10}\b/ },
    { name: "Email Address", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
    { name: "UPI ID", regex: /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/ },
    { name: "Bank Account", regex: /\b\d{9,18}\b/ },
    { name: "IFSC Code", regex: /[A-Z]{4}0[A-Z0-9]{6}/ },
    { name: "Social Handle", regex: /@[a-zA-Z0-9_.]+/ },
    // --- NEW PATTERNS ADDED BELOW ---
    { name: "Website/Link", regex: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.(com|in|net|org|me)\b)/ },
    { name: "Social Media Link", regex: /(instagram\.com|facebook\.com|linkedin\.com|twitter\.com|wa\.me|t\.me)/i },
    { name: "Payment App", regex: /\b(gpay|paytm|phonepe|google pay)\b/i }
];

export function checkPII(message: string): { isSafe: boolean; detected?: string } {
    for (const pattern of PII_PATTERNS) {
        if (pattern.regex.test(message)) {
            return { isSafe: false, detected: pattern.name };
        }
    }
    return { isSafe: true };
}