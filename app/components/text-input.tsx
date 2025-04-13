import { KeyboardEvent } from "react";

type BindedInputProps = {
    type?: "text" | "password";
    bind: [string, (nextText: string) => any];
    valid?: boolean;
    className?: string;
    placeholder?: string;
    maxChars?: number;
    onSubmit?: () => any 
};
export default function BindedInput({
    type = "text",
    bind,
    valid,
    className,
    placeholder,
    maxChars,
    onSubmit
}: BindedInputProps) {
    const [text, setText] = bind;
    
    const showCharLimit = (maxChars != undefined) && (text.length > maxChars - 10);
    const limitExceeded = (maxChars != undefined) && (text.length > maxChars);
    
    const handleKeyDown = onSubmit?
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !limitExceeded) 
                onSubmit();
        }
        : undefined;
    
    return (
        <div className="relative grow">
            <input
                type={type}
                placeholder={placeholder}
                onInput={(e) => setText(e.currentTarget.value) }
                className={`${className} ${valid == false && "text-failure!"} w-full ${showCharLimit && "pr-15"}`}
                value={text}
                onKeyDown={handleKeyDown}
            />
            {   showCharLimit && 
                <p className={`
                    absolute right-2 top-1/2 -translate-y-1/2 
                    bg-background ${limitExceeded && "text-failure"} rounded-md px-1
                    text-sm
                `}>
                    {text.length}/{maxChars}
                </p>
            }
        </div>
    );
}