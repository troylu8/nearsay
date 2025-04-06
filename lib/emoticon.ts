






// emoticon index = line number - 10
export const EMOTICONS: Readonly<string[]> = [
    "(T^T)",
    "(^▽^)",
    "(-3-)",
    "(>ᴗ<)",
    "(╹ᴗ╹)",
];
export function randomEmoticonIndex(seed?: string) {
    if (seed) {
        let total = 0;
        for (const ch of seed) {
            total += ch.charCodeAt(0);
        }
        return total % EMOTICONS.length;
    }
    
    return Math.floor(Math.random() * EMOTICONS.length);
}

export function randomEmoticon(seed?: string) {
    return EMOTICONS[randomEmoticonIndex(seed)];
}