import seedrandom from "seedrandom";






// emoticon index = line number - 10
export const EMOTICONS: Readonly<string[]> = [
    "(T^T)",
    "(^▽^)",
    "(-3-)",
    "(>ᴗ<)",
    "(╹ᴗ╹)",
    "(T^T)",
    "(^▽^)",
    "(-3-)",
    "(>ᴗ<)",
    "(╹ᴗ╹)",
];
export function randomEmoticonIndex(seed?: string) {
    return Math.floor(seedrandom(seed)() * EMOTICONS.length);
}

export function randomEmoticon(seed?: string) {
    return EMOTICONS[randomEmoticonIndex(seed)];
}