
type Props = {
    type?: "text" | "password";
    textState: [string, (nextText: string) => any];
    valid?: boolean;
    placeholder?: string;
};
export default function TextInput({
    type = "text",
    textState,
    valid = true,
    placeholder,
}: Props) {
    const [text, setText] = textState;

    return (
        <input
            type={type}
            placeholder={placeholder}
            onInput={(e) => setText(e.currentTarget.value)}
            className={valid ? "text-green-300" : "text-red-400"}
            value={text}
        />
    );
}
