






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
export function randomEmoticonIndex() {
    return Math.floor(Math.random() * EMOTICONS.length);
}
export function randomEmoticon() {
    return EMOTICONS[randomEmoticonIndex()];
}