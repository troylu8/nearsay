import { KeyboardEvent } from "react";

type BindedInputProps = {
    type?: "text" | "password";
    bind: [string, (nextText: string) => any];
    valid?: boolean;
    className?: string;
    placeholder?: string;
    onSubmit?: () => any 
};
export default function BindedInput({
    type = "text",
    bind,
    valid,
    className,
    placeholder,
    onSubmit
}: BindedInputProps) {
    const [text, setText] = bind;

    const handleKeyDown = onSubmit?
        (e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && onSubmit()
        : undefined;

    return (
        <input
            type={type}
            placeholder={placeholder}
            onInput={(e) => setText(e.currentTarget.value)}
            className={
                className + (
                    valid == true ? "text-red-400" : 
                    valid == false? "text-green-300" : 
                    ""  // if valid == undefined, apply neither
                )
            } 
            value={text}
            onKeyDown={handleKeyDown}
        />
    );
}