import { FormEvent } from "react";

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

    function handleInput(e: FormEvent<HTMLInputElement>) {
        const value = e.currentTarget.value.trim();
        setText(value);
    }

    return (
        <input
            type={type}
            placeholder={placeholder}
            onInput={handleInput}
            className={valid ? "text-green-300" : "text-red-400"}
            value={text}
        />
    );
}
